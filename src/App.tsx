"use client";

import { useEffect, useMemo, useState } from "react";
import { CONCEPT_ENRICHMENT, MEMOS, REVIEW_VARIANTS } from "./content";
import { DAILY_PROGRAM, PROGRAM_END, PROGRAM_START, type DailyMissionPlan } from "./daily-program";

type View = "dashboard" | "daily" | "missions" | "glossary" | "review" | "memos" | "progress";
type Category = "Matériel" | "Réseau" | "Windows" | "Sécurité";

type Quiz = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

type Concept = {
  id: string;
  term: string;
  category: Category;
  short: string;
  definition: string;
  example: string;
  confusion: string;
  quiz: Quiz;
};

type MissionStep = {
  title: string;
  prompt: string;
  options: {
    label: string;
    correct: boolean;
    feedback: string;
    concepts: string[];
  }[];
  takeaway: string;
};

type Mission = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3;
  duration: string;
  concepts: string[];
  steps: MissionStep[];
};

type ConceptProgress = {
  attempts: number;
  successes: number;
  failures: number;
  strength: number;
  lastSeen: number;
  nextReview: number;
};

type DailyConfidence = "trop-facile" | "juste" | "difficile";

type DailyRecord = {
  notes: string;
  completedAt?: number;
  score?: number;
  questions?: number;
  confidence?: DailyConfidence;
};

type Progress = {
  version: 2;
  xp: number;
  answers: number;
  correct: number;
  completedMissions: string[];
  concepts: Record<string, ConceptProgress>;
  activeDays: string[];
  dailyMissions: Record<string, DailyRecord>;
};

type DailyQuizItem = {
  conceptId: string;
  question: Quiz;
};

const DAY = 86_400_000;
const STORAGE_KEY = "atelier-ti-progress-v1";

const CONCEPTS: Concept[] = [
  {
    id: "ram",
    term: "RAM",
    category: "Matériel",
    short: "La mémoire de travail temporaire du PC.",
    definition:
      "La RAM conserve les données dont le processeur a besoin immédiatement. Elle se vide quand l’ordinateur s’éteint.",
    example:
      "Trop peu de RAM peut provoquer des ralentissements quand plusieurs applications sont ouvertes.",
    confusion:
      "La RAM n’est pas le stockage : elle ne remplace ni le SSD ni le disque dur.",
    quiz: {
      question: "Quelle affirmation décrit correctement la RAM ?",
      options: [
        "Elle stocke les fichiers même PC éteint",
        "Elle sert de mémoire de travail temporaire",
        "Elle fournit l’électricité aux composants",
      ],
      answer: 1,
      explanation:
        "La RAM est rapide et temporaire. Le SSD ou le disque dur assure le stockage durable.",
    },
  },
  {
    id: "cpu",
    term: "CPU / processeur",
    category: "Matériel",
    short: "Le composant qui exécute les instructions.",
    definition:
      "Le CPU traite les calculs et coordonne une grande partie des opérations du système.",
    example:
      "Une tâche à 100 % de CPU peut rendre l’interface lente même si le disque va bien.",
    confusion:
      "Un processeur plus puissant ne corrige pas un disque saturé ou un manque de RAM.",
    quiz: {
      question: "Le Gestionnaire des tâches affiche 100 % de CPU. Cela indique surtout…",
      options: [
        "une forte sollicitation du processeur",
        "un câble réseau débranché",
        "un SSD forcément défectueux",
      ],
      answer: 0,
      explanation:
        "Le pourcentage CPU mesure l’activité du processeur. Il faut ensuite identifier le processus responsable.",
    },
  },
  {
    id: "ssd",
    term: "SSD",
    category: "Matériel",
    short: "Un stockage permanent, rapide et sans pièce mobile.",
    definition:
      "Le SSD conserve Windows, les logiciels et les fichiers après extinction. Il utilise de la mémoire flash.",
    example:
      "Remplacer un vieux disque mécanique par un SSD accélère souvent fortement le démarrage.",
    confusion:
      "Un SSD n’est pas de la RAM, même si les deux utilisent des puces mémoire.",
    quiz: {
      question: "Quel élément conserve les fichiers quand le PC est éteint ?",
      options: ["La RAM", "Le SSD", "Le cache du processeur"],
      answer: 1,
      explanation: "Le SSD est un stockage non volatil : ses données persistent sans alimentation.",
    },
  },
  {
    id: "psu",
    term: "Bloc d’alimentation",
    category: "Matériel",
    short: "Il convertit et distribue l’énergie électrique.",
    definition:
      "Le bloc d’alimentation, ou PSU, transforme le courant secteur en tensions utilisables par les composants.",
    example:
      "Des ventilateurs qui tournent ne prouvent pas que toutes les tensions délivrées sont correctes.",
    confusion:
      "Ne jamais ouvrir un bloc d’alimentation : ses condensateurs peuvent rester dangereux, même débranché.",
    quiz: {
      question: "Quelle précaution est correcte face à un bloc d’alimentation suspect ?",
      options: [
        "L’ouvrir pour regarder les condensateurs",
        "Le tester ou le remplacer sans ouvrir son boîtier",
        "Le secouer pendant que le PC fonctionne",
      ],
      answer: 1,
      explanation:
        "On ne démonte pas le boîtier d’un bloc d’alimentation. Le diagnostic se fait avec des outils adaptés ou par substitution.",
    },
  },
  {
    id: "gpu",
    term: "GPU / carte graphique",
    category: "Matériel",
    short: "Il produit l’image envoyée à l’écran.",
    definition:
      "Le GPU calcule l’affichage. Il peut être intégré au processeur ou présent sur une carte graphique dédiée.",
    example:
      "Avec une carte dédiée, l’écran doit généralement être branché sur ses sorties, pas sur la carte mère.",
    confusion:
      "Toutes les prises vidéo visibles à l’arrière d’un PC ne sont pas forcément actives.",
    quiz: {
      question: "Un PC possède une carte graphique dédiée. Où brancher d’abord l’écran ?",
      options: [
        "Sur une sortie vidéo de la carte graphique",
        "Sur n’importe quel port USB",
        "Sur la prise réseau",
      ],
      answer: 0,
      explanation:
        "Les sorties de la carte dédiée sont généralement plus bas sur le boîtier, alignées avec les cartes d’extension.",
    },
  },
  {
    id: "bios",
    term: "BIOS / UEFI",
    category: "Matériel",
    short: "Le micrologiciel qui initialise le matériel au démarrage.",
    definition:
      "Le BIOS ou l’UEFI vérifie et initialise les composants avant de lancer le système d’exploitation.",
    example:
      "Un ordre de démarrage incorrect peut empêcher le PC de lancer Windows depuis le bon disque.",
    confusion:
      "Le BIOS/UEFI n’est pas Windows et reste accessible même si Windows ne démarre plus.",
    quiz: {
      question: "À quel moment le BIOS/UEFI intervient-il ?",
      options: [
        "Avant le chargement de Windows",
        "Uniquement quand Internet fonctionne",
        "Après la fermeture de toutes les applications",
      ],
      answer: 0,
      explanation:
        "Il initialise le matériel puis transmet le démarrage au système d’exploitation.",
    },
  },
  {
    id: "video-cable",
    term: "HDMI / DisplayPort",
    category: "Matériel",
    short: "Des liaisons numériques pour l’image et souvent le son.",
    definition:
      "HDMI et DisplayPort transportent un signal vidéo numérique. Le bon port et la bonne source doivent être sélectionnés.",
    example:
      "Un écran réglé sur HDMI 2 restera noir si le câble arrive sur HDMI 1.",
    confusion:
      "Un câble physiquement branché peut être défectueux ou connecté à la mauvaise sortie.",
    quiz: {
      question: "Avant d’ouvrir un PC sans affichage, quel test est raisonnable ?",
      options: [
        "Réinstaller Windows",
        "Vérifier la source de l’écran et essayer un autre câble",
        "Mettre à jour tous les pilotes à l’aveugle",
      ],
      answer: 1,
      explanation:
        "On commence par les causes externes simples, rapides et réversibles.",
    },
  },
  {
    id: "ip",
    term: "Adresse IP",
    category: "Réseau",
    short: "L’adresse logique d’un appareil sur un réseau.",
    definition:
      "Une adresse IP permet d’identifier une interface et d’acheminer les communications sur un réseau.",
    example:
      "Sur un réseau domestique, une adresse peut ressembler à 192.168.1.42.",
    confusion:
      "L’adresse IP n’est ni le nom Wi-Fi ni l’adresse physique MAC.",
    quiz: {
      question: "Laquelle ressemble à une adresse IPv4 privée courante ?",
      options: ["192.168.1.42", "255 GHz", "PC-SALON.local/user"],
      answer: 0,
      explanation: "192.168.1.42 est une adresse IPv4 privée typique d’un réseau local.",
    },
  },
  {
    id: "dhcp",
    term: "DHCP",
    category: "Réseau",
    short: "Le service qui distribue automatiquement les paramètres réseau.",
    definition:
      "Le DHCP attribue généralement l’adresse IP, le masque, la passerelle et les serveurs DNS aux appareils.",
    example:
      "Une adresse en 169.254.x.x sous Windows signale souvent l’échec de l’attribution DHCP.",
    confusion:
      "Le DHCP distribue des paramètres ; il ne traduit pas les noms de domaine.",
    quiz: {
      question: "Un PC reçoit automatiquement son adresse IP. Quel service s’en charge ?",
      options: ["DNS", "DHCP", "HTTPS"],
      answer: 1,
      explanation: "Le DHCP fournit automatiquement la configuration réseau aux clients.",
    },
  },
  {
    id: "dns",
    term: "DNS",
    category: "Réseau",
    short: "L’annuaire qui traduit les noms en adresses IP.",
    definition:
      "Le DNS associe un nom lisible, comme example.com, à l’adresse IP du serveur correspondant.",
    example:
      "Si un ping vers 1.1.1.1 fonctionne mais pas vers un nom de domaine, le DNS devient un suspect sérieux.",
    confusion:
      "Le DNS ne fournit pas l’accès Internet à lui seul : il résout des noms.",
    quiz: {
      question: "À quoi sert principalement le DNS ?",
      options: [
        "À traduire un nom de domaine en adresse IP",
        "À alimenter le routeur",
        "À chiffrer le disque dur",
      ],
      answer: 0,
      explanation: "Le DNS agit comme un annuaire pour retrouver l’adresse IP associée à un nom.",
    },
  },
  {
    id: "gateway",
    term: "Passerelle par défaut",
    category: "Réseau",
    short: "La porte de sortie du réseau local.",
    definition:
      "La passerelle transmet vers d’autres réseaux les paquets qui ne sont pas destinés au réseau local.",
    example:
      "À domicile, la passerelle est généralement l’adresse locale de la box ou du routeur.",
    confusion:
      "La passerelle n’est pas nécessairement le serveur DNS, même si la box peut remplir les deux rôles.",
    quiz: {
      question: "Sur un réseau domestique, la passerelle par défaut est généralement…",
      options: ["la box ou le routeur", "le clavier", "le serveur d’impression Windows"],
      answer: 0,
      explanation: "La box/routeur relie le réseau local aux réseaux extérieurs.",
    },
  },
  {
    id: "ping",
    term: "Ping",
    category: "Réseau",
    short: "Un test simple de joignabilité réseau.",
    definition:
      "La commande ping envoie de petits messages pour vérifier si une destination répond et mesurer un délai approximatif.",
    example:
      "Pinger la passerelle aide à distinguer un problème local d’un problème d’accès extérieur.",
    confusion:
      "L’absence de réponse ne prouve pas toujours une panne : certains équipements bloquent volontairement le ping.",
    quiz: {
      question: "Pourquoi pinger d’abord la passerelle ?",
      options: [
        "Pour tester le lien jusqu’au routeur local",
        "Pour réparer automatiquement Windows",
        "Pour mesurer l’espace libre du SSD",
      ],
      answer: 0,
      explanation: "Cela vérifie une première portion du chemin réseau avant de tester plus loin.",
    },
  },
  {
    id: "driver",
    term: "Pilote",
    category: "Windows",
    short: "Le logiciel qui permet au système de dialoguer avec un matériel.",
    definition:
      "Un pilote traduit les demandes du système en instructions comprises par un périphérique précis.",
    example:
      "Un pilote Wi-Fi absent peut faire disparaître l’adaptateur du réseau disponible.",
    confusion:
      "Un pilote n’est pas l’application utilisée avec le périphérique, même si les deux sont parfois installés ensemble.",
    quiz: {
      question: "Quel est le rôle d’un pilote de périphérique ?",
      options: [
        "Permettre à Windows de communiquer avec le matériel",
        "Créer un compte utilisateur",
        "Remplacer physiquement le périphérique",
      ],
      answer: 0,
      explanation: "Le pilote est l’intermédiaire logiciel entre le système et le matériel.",
    },
  },
  {
    id: "task-manager",
    term: "Gestionnaire des tâches",
    category: "Windows",
    short: "L’outil qui montre processus et ressources utilisées.",
    definition:
      "Le Gestionnaire des tâches permet d’observer CPU, mémoire, disque, réseau et applications au démarrage.",
    example:
      "Trier les processus par utilisation du disque peut révéler la cause d’un ralentissement.",
    confusion:
      "Fermer un processus au hasard peut interrompre un travail ou déstabiliser le système.",
    quiz: {
      question: "Premier réflexe face à un Windows lent mais fonctionnel ?",
      options: [
        "Observer les ressources dans le Gestionnaire des tâches",
        "Supprimer System32",
        "Changer immédiatement la carte mère",
      ],
      answer: 0,
      explanation: "Mesurer avant d’agir évite de traiter une cause imaginaire.",
    },
  },
  {
    id: "safe-mode",
    term: "Mode sans échec",
    category: "Windows",
    short: "Un démarrage minimal pour isoler certains problèmes.",
    definition:
      "Le mode sans échec lance Windows avec un ensemble limité de pilotes et de services.",
    example:
      "Si le problème disparaît en mode sans échec, un pilote ou service tiers devient plus suspect.",
    confusion:
      "Ce mode ne répare pas tout seul la panne ; il aide à isoler sa cause.",
    quiz: {
      question: "Le mode sans échec sert surtout à…",
      options: [
        "démarrer avec un minimum de pilotes et services",
        "augmenter la fréquence du processeur",
        "contourner tous les mots de passe",
      ],
      answer: 0,
      explanation: "Ce démarrage minimal aide à comparer et isoler les causes logicielles.",
    },
  },
  {
    id: "backup",
    term: "Sauvegarde",
    category: "Sécurité",
    short: "Une copie récupérable, séparée de l’original.",
    definition:
      "Une sauvegarde protège les données contre la panne, l’erreur humaine, le vol ou un logiciel malveillant.",
    example:
      "Copier les photos sur un disque externe puis débrancher ce disque limite plusieurs risques.",
    confusion:
      "La synchronisation seule n’est pas toujours une sauvegarde : une suppression peut aussi être synchronisée.",
    quiz: {
      question: "Quel exemple constitue la meilleure sauvegarde ?",
      options: [
        "Une copie séparée, vérifiée et récupérable",
        "Un raccourci sur le Bureau",
        "Le même fichier renommé dans le même dossier",
      ],
      answer: 0,
      explanation: "Une sauvegarde doit survivre à la perte ou à l’altération de l’original.",
    },
  },
  {
    id: "phishing",
    term: "Hameçonnage / phishing",
    category: "Sécurité",
    short: "Une tentative de tromperie pour voler une information ou un accès.",
    definition:
      "L’hameçonnage imite une personne ou un service légitime afin de pousser à cliquer, payer ou révéler un secret.",
    example:
      "Un faux message de livraison peut demander de régler quelques centimes sur un site imité.",
    confusion:
      "Une apparence soignée ou un cadenas HTTPS ne prouvent pas que l’expéditeur est légitime.",
    quiz: {
      question: "Quel indice doit faire ralentir avant de cliquer ?",
      options: [
        "Une urgence inhabituelle et une adresse d’expéditeur douteuse",
        "Une formule de politesse correcte",
        "La présence du logo de l’entreprise",
      ],
      answer: 0,
      explanation: "L’urgence artificielle et l’identité incohérente sont deux signaux classiques d’hameçonnage.",
    },
  },
  {
    id: "least-privilege",
    term: "Moindre privilège",
    category: "Sécurité",
    short: "N’accorder que les droits réellement nécessaires.",
    definition:
      "Le principe du moindre privilège limite les comptes et logiciels aux autorisations utiles à leur tâche.",
    example:
      "Utiliser un compte standard au quotidien réduit l’impact de certaines erreurs ou infections.",
    confusion:
      "Cela ne signifie pas bloquer tout le monde, mais ajuster les droits au besoin réel.",
    quiz: {
      question: "Le principe du moindre privilège recommande de…",
      options: [
        "donner uniquement les droits nécessaires",
        "rendre tout le monde administrateur",
        "partager un compte unique entre collègues",
      ],
      answer: 0,
      explanation: "Moins de droits inutiles signifie moins de dégâts possibles en cas d’erreur ou de compromission.",
    },
  },
];

const MISSIONS: Mission[] = [
  {
    id: "no-display",
    eyebrow: "Mission de départ",
    title: "Le PC s’allume, mais aucun affichage",
    description:
      "Les ventilateurs tournent, les voyants s’allument, mais l’écran reste obstinément noir.",
    difficulty: 1,
    duration: "8–12 min",
    concepts: ["video-cable", "gpu", "ram", "bios", "psu"],
    steps: [
      {
        title: "Observer avant de démonter",
        prompt: "Quelle est la première action la plus rationnelle ?",
        options: [
          {
            label: "Éteindre le PC et réenficher immédiatement les barrettes de RAM",
            correct: false,
            feedback:
              "C’est une piste possible plus tard, mais elle impose déjà d’ouvrir la machine. Les contrôles externes apportent d’abord une information à moindre risque.",
            concepts: ["bios"],
          },
          {
            label: "Vérifier l’alimentation, la source et le câble de l’écran",
            correct: true,
            feedback:
              "Oui. On élimine d’abord les causes externes, simples, rapides et réversibles.",
            concepts: ["video-cable"],
          },
          {
            label: "Réinitialiser le CMOS avant de vérifier l’écran et sa source",
            correct: false,
            feedback:
              "Une réinitialisation peut aider après un réglage instable, mais elle efface la configuration et ne cible pas encore le maillon le plus simple à vérifier.",
            concepts: ["psu"],
          },
        ],
        takeaway: "Commencer par le simple n’est pas paresseux : c’est une méthode de réduction des hypothèses.",
      },
      {
        title: "Isoler l’écran",
        prompt:
          "L’écran est alimenté, mais indique « Aucun signal ». Quel test apporte le plus d’information ?",
        options: [
          {
            label: "Tester un autre câble ou une autre source vidéo connue",
            correct: true,
            feedback:
              "Exact. La substitution par un élément connu comme fonctionnel isole câble, écran et sortie.",
            concepts: ["video-cable"],
          },
          {
            label: "Redémarrer plusieurs fois pour voir si l’image finit par apparaître",
            correct: false,
            feedback:
              "Tu pourrais observer un comportement intermittent, mais ce test change peu l’état des hypothèses. Une substitution câble/source est plus discriminante.",
            concepts: ["video-cable"],
          },
          {
            label: "Retirer puis remettre la carte graphique avant tout autre essai",
            correct: false,
            feedback:
              "La carte reste une hypothèse, mais cette action est plus invasive qu’un test externe avec un élément connu comme fonctionnel.",
            concepts: ["driver", "bios"],
          },
        ],
        takeaway: "Un bon test change une seule variable et utilise, si possible, un élément dont on connaît l’état.",
      },
      {
        title: "Repérer la bonne sortie",
        prompt:
          "Une carte graphique dédiée est installée, mais le câble est branché sur la carte mère. Que faire ?",
        options: [
          {
            label: "Brancher l’écran sur une sortie de la carte graphique",
            correct: true,
            feedback:
              "Oui. Les sorties de la carte mère peuvent être inactives lorsqu’une carte dédiée est utilisée.",
            concepts: ["gpu", "video-cable"],
          },
          {
            label: "Désactiver d’abord le GPU intégré dans l’UEFI",
            correct: false,
            feedback: "Ce réglage peut modifier le choix du GPU, mais il est difficile à faire sans image et inutile avant d’essayer la sortie dédiée déjà disponible.",
            concepts: ["gpu", "video-cable"],
          },
          {
            label: "Déposer puis réinstaller la carte graphique avant d’essayer ses sorties",
            correct: false,
            feedback: "Réenficher la carte peut être pertinent ensuite. Brancher d’abord le câble sur sa sortie teste la même piste sans ouvrir le boîtier.",
            concepts: ["gpu"],
          },
        ],
        takeaway: "Toujours identifier le chemin réel du signal : source, sortie, câble, entrée, écran.",
      },
      {
        title: "Passer à l’intérieur",
        prompt:
          "Les tests externes sont bons. Après extinction et débranchement du PC, quelle vérification vient ensuite ?",
        options: [
          {
            label: "Retirer puis remettre correctement une barrette de RAM",
            correct: true,
            feedback:
              "Bon choix. Une RAM mal enfichée peut empêcher le test de démarrage et donc tout affichage.",
            concepts: ["ram", "bios"],
          },
          {
            label: "Réinitialiser le CMOS avant de tester chaque barrette",
            correct: false,
            feedback: "Possible après un réglage mémoire instable, mais tester la connexion et une barrette à la fois préserve mieux les réglages et localise davantage.",
            concepts: ["ram"],
          },
          {
            label: "Déconnecter tous les supports de stockage avant d’examiner la RAM",
            correct: false,
            feedback: "Un support peut bloquer plus tard le démarrage, mais une absence totale de POST et d’affichage rend la mémoire plus prioritaire à ce stade.",
            concepts: ["cpu", "psu"],
          },
        ],
        takeaway: "À l’intérieur : hors tension, gestes antistatiques, une seule modification à la fois, puis nouveau test.",
      },
    ],
  },
  {
    id: "wifi-no-internet",
    eyebrow: "Réseau",
    title: "Le Wi-Fi est connecté, Internet ne répond pas",
    description:
      "L’icône Wi-Fi semble rassurante. Le navigateur, lui, n’a reçu aucune consigne pour participer à cette illusion.",
    difficulty: 2,
    duration: "10–15 min",
    concepts: ["ip", "dhcp", "dns", "gateway", "ping"],
    steps: [
      {
        title: "Définir le périmètre",
        prompt: "Que faut-il déterminer en premier ?",
        options: [
          {
            label: "Si le problème touche un seul appareil ou tout le réseau",
            correct: true,
            feedback: "Oui. Le périmètre oriente immédiatement vers le poste, le Wi-Fi, la box ou l’accès opérateur.",
            concepts: ["gateway"],
          },
          {
            label: "Relever immédiatement ipconfig /all sur le poste concerné",
            correct: false,
            feedback: "Cette commande sera utile, mais savoir d’abord si d’autres appareils sont touchés change l’interprétation de tous ses résultats.",
            concepts: ["ip"],
          },
          {
            label: "Redémarrer la box puis vérifier si le poste retrouve Internet",
            correct: false,
            feedback: "Le redémarrage peut restaurer le service, mais il intervient avant d’avoir distingué panne locale et panne collective.",
            concepts: ["gateway"],
          },
        ],
        takeaway: "Qui est touché, depuis quand, et qu’est-ce qui fonctionne encore ? Trois questions avant toute action.",
      },
      {
        title: "Lire la configuration",
        prompt: "Windows affiche une adresse 169.254.18.7. Quelle hypothèse devient prioritaire ?",
        options: [
          {
            label: "Le PC n’a probablement pas reçu de configuration DHCP",
            correct: true,
            feedback: "Exact. Windows s’attribue souvent une adresse 169.254.x.x quand le DHCP ne répond pas.",
            concepts: ["ip", "dhcp"],
          },
          {
            label: "Le serveur DNS configuré ne répond probablement pas",
            correct: false,
            feedback: "Le DNS pourra aussi poser problème, mais l’adresse 169.254 montre que l’obtention de la configuration IP a déjà échoué en amont.",
            concepts: ["dns", "dhcp"],
          },
          {
            label: "Une ancienne adresse statique bloque probablement la résolution des noms",
            correct: false,
            feedback: "Une configuration statique peut créer d’autres incohérences, mais une adresse 169.254 est typiquement auto-attribuée après l’échec de la configuration automatique.",
            concepts: ["ssd", "ip"],
          },
        ],
        takeaway: "Une adresse IP raconte déjà une partie de l’histoire. Il faut apprendre à la lire avant de cliquer partout.",
      },
      {
        title: "Tester par étages",
        prompt: "Quel ordre de tests est le plus informatif ?",
        options: [
          {
            label: "Passerelle locale, adresse IP publique, puis nom de domaine",
            correct: true,
            feedback: "Parfait. Chaque test ajoute un étage : réseau local, accès extérieur, puis résolution DNS.",
            concepts: ["ping", "gateway", "dns"],
          },
          {
            label: "Adresse IP publique, nom de domaine, puis passerelle locale",
            correct: false,
            feedback: "Ces tests peuvent produire des indices, mais commencer au loin complique l’interprétation. L’ordre proche-vers-lointain localise le premier étage défaillant.",
            concepts: ["ping", "cpu"],
          },
          {
            label: "nslookup, vidage du cache DNS, puis test de la passerelle",
            correct: false,
            feedback: "Cette séquence intervient sur le DNS avant d’avoir prouvé la connectivité locale et modifie déjà un état avec le vidage du cache.",
            concepts: ["ping", "gateway"],
          },
        ],
        takeaway: "Un diagnostic réseau efficace suit le trajet des paquets du plus proche au plus lointain.",
      },
      {
        title: "Interpréter le résultat",
        prompt: "1.1.1.1 répond, mais ping example.com indique « hôte introuvable ». Quel suspect ressort ?",
        options: [
          {
            label: "La résolution DNS",
            correct: true,
            feedback: "Oui. L’accès IP fonctionne ; c’est la traduction du nom qui semble échouer.",
            concepts: ["dns", "ping"],
          },
          {
            label: "La route par défaut du poste est absente",
            correct: false,
            feedback: "Une adresse extérieure a répondu : le poste dispose donc d’un chemin IP utilisable à cet instant.",
            concepts: ["video-cable", "dns"],
          },
          {
            label: "Le serveur distant bloque les requêtes ICMP",
            correct: false,
            feedback: "Un filtrage ICMP produirait plutôt un délai ou une absence de réponse après résolution. Ici, le nom n’est même pas traduit en adresse.",
            concepts: ["ram", "dns"],
          },
        ],
        takeaway: "Comparer un accès par IP et par nom permet de tester spécifiquement la couche DNS.",
      },
    ],
  },
  {
    id: "slow-windows",
    eyebrow: "Windows",
    title: "Le poste est devenu très lent",
    description:
      "Il démarre, mais chaque clic semble devoir être validé par une commission administrative invisible.",
    difficulty: 2,
    duration: "10–15 min",
    concepts: ["task-manager", "cpu", "ram", "ssd", "safe-mode"],
    steps: [
      {
        title: "Mesurer le symptôme",
        prompt: "Quelle première action évite de diagnostiquer au hasard ?",
        options: [
          {
            label: "Observer CPU, mémoire et disque dans le Gestionnaire des tâches",
            correct: true,
            feedback: "Oui. Mesurer permet de relier le ressenti à une ressource et à un processus.",
            concepts: ["task-manager", "cpu", "ram", "ssd"],
          },
          {
            label: "Consulter d’abord le Moniteur de fiabilité et tous les journaux système",
            correct: false,
            feedback: "Ces outils peuvent compléter l’enquête, mais ils sont moins directs que les mesures en temps réel pendant que la lenteur se produit.",
            concepts: ["task-manager", "phishing"],
          },
          {
            label: "Désactiver une à une les applications de démarrage sans mesure initiale",
            correct: false,
            feedback: "La piste est crédible, mais sans état initial tu ne sais pas quelle ressource sature ni quel changement aura réellement aidé.",
            concepts: ["task-manager"],
          },
        ],
        takeaway: "Le symptôme « lent » doit devenir une observation mesurable : quand, sur quoi, et quelle ressource sature ?",
      },
      {
        title: "Identifier le responsable",
        prompt: "Le disque reste à 100 %. Quelle action vient ensuite ?",
        options: [
          {
            label: "Trier les processus par activité disque et observer",
            correct: true,
            feedback: "Exact. Il faut relier la saturation à un processus avant de décider quoi arrêter ou corriger.",
            concepts: ["task-manager", "ssd"],
          },
          {
            label: "Contrôler d’abord SMART et lancer un test complet du support",
            correct: false,
            feedback: "L’état du support compte, mais trier les processus pendant la saturation distingue d’abord activité logicielle et anomalie matérielle probable.",
            concepts: ["ssd"],
          },
          {
            label: "Désactiver simultanément l’indexation et l’antivirus pour comparer",
            correct: false,
            feedback: "Ces services peuvent solliciter le disque, mais en changer deux à la fois détruit la valeur comparative du test et réduit la protection.",
            concepts: ["task-manager", "least-privilege"],
          },
        ],
        takeaway: "Une ressource saturée est un indice ; le processus et le contexte donnent la cause probable.",
      },
      {
        title: "Comparer un démarrage minimal",
        prompt: "Pourquoi tester le mode sans échec ?",
        options: [
          {
            label: "Pour voir si le problème persiste avec peu de pilotes et services",
            correct: true,
            feedback: "Oui. La comparaison aide à distinguer une cause tierce d’un problème plus fondamental.",
            concepts: ["safe-mode", "driver"],
          },
          {
            label: "Pour libérer des ressources et mesurer la puissance maximale du matériel",
            correct: false,
            feedback: "Il charge moins d’éléments, mais son intérêt principal est la comparaison diagnostique, pas un benchmark représentatif.",
            concepts: ["safe-mode", "cpu"],
          },
          {
            label: "Pour réparer automatiquement les pilotes tiers chargés au démarrage",
            correct: false,
            feedback: "Le mode évite d’en charger beaucoup ; il ne les répare ni ne les désinstalle automatiquement.",
            concepts: ["safe-mode", "backup"],
          },
        ],
        takeaway: "Comparer deux conditions de démarrage est une expérience : seule la liste des composants chargés change.",
      },
      {
        title: "Agir proprement",
        prompt: "Une application inutile monopolise le disque au démarrage. Que faire ?",
        options: [
          {
            label: "Désactiver son démarrage automatique, redémarrer et mesurer à nouveau",
            correct: true,
            feedback: "Parfait. L’action est ciblée, réversible et son effet peut être vérifié.",
            concepts: ["task-manager"],
          },
          {
            label: "Désinstaller immédiatement l’application avant de refaire une mesure",
            correct: false,
            feedback: "La désinstallation peut devenir justifiée, mais désactiver d’abord le démarrage est plus réversible et suffit à tester l’hypothèse.",
            concepts: ["task-manager", "safe-mode"],
          },
          {
            label: "Augmenter la taille du fichier d’échange avant le prochain démarrage",
            correct: false,
            feedback: "Cela peut aider sous pression mémoire, mais le symptôme observé pointe déjà vers une application précise au démarrage.",
            concepts: ["ssd"],
          },
        ],
        takeaway: "Une correction de technicien doit être ciblée, réversible, documentée et suivie d’un nouveau test.",
      },
    ],
  },
];

const CATEGORY_ORDER: Category[] = ["Matériel", "Réseau", "Windows", "Sécurité"];

const CONCEPT_REFERENCE_ALIASES: { id: string; aliases: string[] }[] = [
  { id: "task-manager", aliases: ["Gestionnaire des tâches"] },
  { id: "psu", aliases: ["bloc d’alimentation", "PSU"] },
  { id: "gpu", aliases: ["carte graphique", "GPU"] },
  { id: "gateway", aliases: ["passerelle par défaut", "passerelle"] },
  { id: "ip", aliases: ["adresse IPv4", "adresse IPv6", "adresse IP", "IPv4", "IPv6", "IP"] },
  { id: "safe-mode", aliases: ["mode sans échec"] },
  { id: "least-privilege", aliases: ["moindre privilège"] },
  { id: "video-cable", aliases: ["DisplayPort", "HDMI"] },
  { id: "phishing", aliases: ["hameçonnage", "phishing"] },
  { id: "backup", aliases: ["sauvegardes", "sauvegarde"] },
  { id: "driver", aliases: ["Gestionnaire de périphériques", "pilotes", "pilote"] },
  { id: "cpu", aliases: ["processeur", "CPU"] },
  { id: "bios", aliases: ["BIOS", "UEFI", "POST"] },
  { id: "dhcp", aliases: ["DHCP"] },
  { id: "dns", aliases: ["DNS"] },
  { id: "ping", aliases: ["ping"] },
  { id: "ram", aliases: ["RAM"] },
  { id: "ssd", aliases: ["SSD"] },
];

const CONCEPT_ALIAS_LOOKUP = new Map(
  CONCEPT_REFERENCE_ALIASES.flatMap(({ id, aliases }) =>
    aliases.map((alias) => [alias.toLocaleLowerCase("fr"), id] as const),
  ),
);

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const CONCEPT_LINK_PATTERN = new RegExp(
  `(?<![\\p{L}\\p{N}])(${[...CONCEPT_ALIAS_LOOKUP.keys()]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|")})(?![\\p{L}\\p{N}])`,
  "giu",
);

const emptyProgress: Progress = {
  version: 2,
  xp: 0,
  answers: 0,
  correct: 0,
  completedMissions: [],
  concepts: {},
  activeDays: [],
  dailyMissions: {},
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayKey() {
  return dateKey(new Date());
}

function dateFromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function programDate(index: number) {
  const date = dateFromKey(PROGRAM_START);
  date.setDate(date.getDate() + index);
  return date;
}

function formatProgramDate(index: number, long = false) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: long ? "long" : "short",
    day: "numeric",
    month: long ? "long" : "short",
  }).format(programDate(index));
}

function currentProgramIndex(timestamp: number) {
  const today = dateFromKey(dateKey(new Date(timestamp)));
  const start = dateFromKey(PROGRAM_START);
  return Math.floor((today.getTime() - start.getTime()) / DAY);
}

function currentTimestamp() {
  return Date.now();
}

function levelLabel(strength: number, attempts: number) {
  if (!attempts) return "À découvrir";
  if (strength >= 75) return "Solide";
  if (strength >= 50) return "En progrès";
  return "À renforcer";
}

function progressFor(progress: Progress, conceptId: string): ConceptProgress {
  return (
    progress.concepts[conceptId] ?? {
      attempts: 0,
      successes: 0,
      failures: 0,
      strength: 0,
      lastSeen: 0,
      nextReview: 0,
    }
  );
}

function rankConcepts(progress: Progress, exclude?: string) {
  const now = Date.now();
  return [...CONCEPTS]
    .filter((concept) => concept.id !== exclude)
    .sort((a, b) => {
      const pa = progressFor(progress, a.id);
      const pb = progressFor(progress, b.id);
      const score = (p: ConceptProgress) => {
        if (!p.attempts) return 55;
        const overdue = p.nextReview <= now ? 35 : 0;
        const errors = p.failures * 12;
        return 100 - p.strength + overdue + errors;
      };
      return score(pb) - score(pa);
    });
}

function buildReviewQueue(progress: Progress) {
  return rankConcepts(progress)
    .slice(0, 8)
    .map((concept) => concept.id);
}

function rotateQuestion(question: Quiz, shift: number): Quiz {
  const offset = ((shift % question.options.length) + question.options.length) % question.options.length;
  return {
    ...question,
    options: question.options.map((_, index) => question.options[(index + offset) % question.options.length]),
    answer: (question.answer - offset + question.options.length) % question.options.length,
  };
}

function migrateProgress(value: unknown): Progress {
  if (!value || typeof value !== "object") return emptyProgress;
  const saved = value as {
    version?: number;
    xp?: number;
    answers?: number;
    correct?: number;
    completedMissions?: string[];
    concepts?: Record<string, ConceptProgress>;
    activeDays?: string[];
    dailyMissions?: Record<string, DailyRecord>;
  };
  if (saved.version !== 1 && saved.version !== 2) return emptyProgress;
  return {
    version: 2,
    xp: typeof saved.xp === "number" ? saved.xp : 0,
    answers: typeof saved.answers === "number" ? saved.answers : 0,
    correct: typeof saved.correct === "number" ? saved.correct : 0,
    completedMissions: Array.isArray(saved.completedMissions) ? saved.completedMissions : [],
    concepts: saved.concepts && typeof saved.concepts === "object" ? saved.concepts : {},
    activeDays: Array.isArray(saved.activeDays) ? saved.activeDays : [],
    dailyMissions:
      saved.dailyMissions && typeof saved.dailyMissions === "object" ? saved.dailyMissions : {},
  };
}

function buildDailyQuiz(progress: Progress, mission: DailyMissionPlan, dayIndex: number): DailyQuizItem[] {
  const targetIds = [...mission.concepts]
    .filter((id) => CONCEPTS.some((concept) => concept.id === id))
    .sort((a, b) => {
      const pa = progressFor(progress, a);
      const pb = progressFor(progress, b);
      const score = (item: ConceptProgress) =>
        (item.attempts ? 100 - item.strength : 70) + item.failures * 8;
      return score(pb) - score(pa);
    });
  const weakestElsewhere = rankConcepts(progress).find(
    (concept) => !targetIds.includes(concept.id),
  )?.id;
  const ids = [...new Set([
    targetIds[0],
    targetIds[1],
    weakestElsewhere,
    targetIds[2],
    targetIds[3],
  ].filter((id): id is string => Boolean(id)))].slice(0, 3);

  return ids.map((conceptId, slot) => {
    const concept = CONCEPTS.find((item) => item.id === conceptId) ?? CONCEPTS[0];
    const variants = REVIEW_VARIANTS[conceptId] ?? [concept.quiz];
    const variantIndex =
      (progressFor(progress, conceptId).attempts + dayIndex + slot) % variants.length;
    return {
      conceptId,
      question: rotateQuestion(variants[variantIndex], dayIndex + slot + 1),
    };
  });
}

function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "dashboard")
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    );
  if (name === "missions")
    return (
      <svg {...common}>
        <path d="M14.7 6.3a4 4 0 0 0-5 5L3.5 17.5a2.1 2.1 0 0 0 3 3l6.2-6.2a4 4 0 0 0 5-5l-2.4 2.4-3-3Z" />
      </svg>
    );
  if (name === "calendar")
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="16" rx="1" />
        <path d="M7 3v4M17 3v4M3 10h18" />
        <path d="M7 14h3M14 14h3M7 18h3" />
      </svg>
    );
  if (name === "glossary")
    return (
      <svg {...common}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      </svg>
    );
  if (name === "review")
    return (
      <svg {...common}>
        <path d="M9 5h10M9 12h10M9 19h10" />
        <path d="m3.5 5 1 1 2-2M3.5 12l1 1 2-2M3.5 19l1 1 2-2" />
      </svg>
    );
  if (name === "memo")
    return (
      <svg {...common}>
        <path d="M5 3h11l3 3v15H5Z" />
        <path d="M15 3v4h4M8 11h8M8 15h8M8 19h5" />
      </svg>
    );
  if (name === "chart")
    return (
      <svg {...common}>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20V8" />
      </svg>
    );
  if (name === "search")
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
    );
  if (name === "arrow")
    return (
      <svg {...common}>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    );
  if (name === "check")
    return (
      <svg {...common}>
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  if (name === "close")
    return (
      <svg {...common}>
        <path d="m6 6 12 12M18 6 6 18" />
      </svg>
    );
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16.5v.5" />
    </svg>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [hydrated, setHydrated] = useState(false);
  const [clock, setClock] = useState(0);
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [missionStep, setMissionStep] = useState(0);
  const [missionChoice, setMissionChoice] = useState<number | null>(null);
  const [missionScore, setMissionScore] = useState(0);
  const [selectedDailyId, setSelectedDailyId] = useState(DAILY_PROGRAM[0].id);
  const [dailyQuiz, setDailyQuiz] = useState<DailyQuizItem[]>([]);
  const [dailyQuizIndex, setDailyQuizIndex] = useState(0);
  const [dailyChoice, setDailyChoice] = useState<number | null>(null);
  const [dailyScore, setDailyScore] = useState(0);
  const [dailyQuizDone, setDailyQuizDone] = useState(false);
  const [glossaryQuery, setGlossaryQuery] = useState("");
  const [glossaryCategory, setGlossaryCategory] = useState<Category | "Tout">("Tout");
  const [openConceptId, setOpenConceptId] = useState<string>("ram");
  const [glossaryReturnView, setGlossaryReturnView] = useState<Exclude<View, "glossary"> | null>(null);
  const [reviewQueue, setReviewQueue] = useState<string[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewVariantIndex, setReviewVariantIndex] = useState(0);
  const [reviewChoice, setReviewChoice] = useState<number | null>(null);
  const [reviewDone, setReviewDone] = useState(false);
  const [reviewSessionScore, setReviewSessionScore] = useState(0);
  const [activeMemoId, setActiveMemoId] = useState(MEMOS[0].id);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const now = currentTimestamp();
      let loadedProgress = emptyProgress;
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          loadedProgress = migrateProgress(JSON.parse(saved));
        }
      } catch {
        // A damaged local save should never block access to the lessons.
      }
      const dayIndex = clamp(currentProgramIndex(now), 0, DAILY_PROGRAM.length - 1);
      const mission = DAILY_PROGRAM[dayIndex];
      setProgress(loadedProgress);
      setSelectedDailyId(mission.id);
      setDailyQuiz(buildDailyQuiz(loadedProgress, mission, dayIndex));
      setClock(now);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress, hydrated]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const attemptedConcepts = CONCEPTS.filter(
    (concept) => progressFor(progress, concept.id).attempts > 0,
  );
  const masteredConcepts = CONCEPTS.filter((concept) => {
    const item = progressFor(progress, concept.id);
    return item.attempts >= 2 && item.strength >= 75;
  });
  const weakConcepts = CONCEPTS.filter((concept) => {
    const item = progressFor(progress, concept.id);
    return item.attempts > 0 && item.strength < 50;
  }).sort(
    (a, b) => progressFor(progress, a.id).strength - progressFor(progress, b.id).strength,
  );
  const dueConcepts = CONCEPTS.filter((concept) => {
    const item = progressFor(progress, concept.id);
    return item.attempts > 0 && item.nextReview <= clock;
  });
  const accuracy = progress.answers
    ? Math.round((progress.correct / progress.answers) * 100)
    : 0;
  const rawProgramIndex = clock ? currentProgramIndex(clock) : -1;
  const todayProgramIndex = clamp(rawProgramIndex, 0, DAILY_PROGRAM.length - 1);
  const availableDailyCount =
    rawProgramIndex < 0 ? 0 : Math.min(rawProgramIndex + 1, DAILY_PROGRAM.length);
  const completedDailyCount = DAILY_PROGRAM.filter(
    (mission) => progress.dailyMissions[mission.id]?.completedAt,
  ).length;
  const dailyBacklog = DAILY_PROGRAM.slice(0, availableDailyCount).filter(
    (mission) => !progress.dailyMissions[mission.id]?.completedAt,
  );

  const activeMission = MISSIONS.find((mission) => mission.id === activeMissionId) ?? null;
  const selectedDailyIndex = Math.max(
    0,
    DAILY_PROGRAM.findIndex((mission) => mission.id === selectedDailyId),
  );
  const selectedDaily = DAILY_PROGRAM[selectedDailyIndex] ?? DAILY_PROGRAM[0];
  const selectedDailyRecord = progress.dailyMissions[selectedDaily.id] ?? { notes: "" };
  const selectedDailyQuestion = dailyQuiz[dailyQuizIndex] ?? null;
  const selectedDailyConcept = selectedDailyQuestion
    ? CONCEPTS.find((concept) => concept.id === selectedDailyQuestion.conceptId) ?? CONCEPTS[0]
    : null;
  const selectedDailyAverage = selectedDaily.concepts.length
    ? Math.round(
        selectedDaily.concepts.reduce(
          (sum, id) => sum + progressFor(progress, id).strength,
          0,
        ) / selectedDaily.concepts.length,
      )
    : 0;
  const dailyMode =
    selectedDailyAverage >= 72
      ? "Approfondissement"
      : selectedDailyAverage >= 38
        ? "Standard"
        : "Guidé";
  const adaptiveDailyFocus =
    rankConcepts(progress).find((concept) => selectedDaily.concepts.includes(concept.id)) ??
    rankConcepts(progress)[0] ??
    CONCEPTS[0];
  const openConcept = CONCEPTS.find((concept) => concept.id === openConceptId) ?? CONCEPTS[0];
  const openEnrichment = CONCEPT_ENRICHMENT[openConcept.id];
  const reviewConceptId = reviewQueue[reviewIndex] ?? rankConcepts(progress)[0]?.id ?? "dns";
  const reviewConcept =
    CONCEPTS.find((concept) => concept.id === reviewConceptId) ?? CONCEPTS[0];
  const reviewVariants = REVIEW_VARIANTS[reviewConcept.id] ?? [reviewConcept.quiz];
  const reviewQuestion = rotateQuestion(
    reviewVariants[reviewVariantIndex % reviewVariants.length],
    reviewVariantIndex + reviewIndex + 1,
  );
  const activeMemo = MEMOS.find((memo) => memo.id === activeMemoId) ?? MEMOS[0];

  const filteredConcepts = useMemo(() => {
    const query = glossaryQuery.trim().toLocaleLowerCase("fr");
    return CONCEPTS.filter((concept) => {
      const categoryMatches = glossaryCategory === "Tout" || concept.category === glossaryCategory;
      const queryMatches =
        !query ||
        `${concept.term} ${concept.short} ${concept.definition} ${CONCEPT_ENRICHMENT[concept.id]?.expansion ?? ""} ${CONCEPT_ENRICHMENT[concept.id]?.history ?? ""}`
          .toLocaleLowerCase("fr")
          .includes(query);
      return categoryMatches && queryMatches;
    });
  }, [glossaryCategory, glossaryQuery]);

  function recordAnswer(conceptIds: string[], correct: boolean, weight = 1) {
    const now = currentTimestamp();
    const day = todayKey();
    setClock(now);
    setProgress((current) => {
      const concepts = { ...current.concepts };
      for (const id of conceptIds) {
        const old = progressFor(current, id);
        const gain = correct ? 18 * weight : -12 * weight;
        const strength = clamp(old.strength + gain);
        const interval = correct
          ? strength >= 80
            ? 7 * DAY
            : strength >= 55
              ? 3 * DAY
              : DAY
          : 10 * 60 * 1000;
        concepts[id] = {
          attempts: old.attempts + 1,
          successes: old.successes + (correct ? 1 : 0),
          failures: old.failures + (correct ? 0 : 1),
          strength,
          lastSeen: now,
          nextReview: now + interval,
        };
      }
      return {
        ...current,
        xp: current.xp + (correct ? Math.max(4, Math.round(10 * weight)) : 2),
        answers: current.answers + 1,
        correct: current.correct + (correct ? 1 : 0),
        concepts,
        activeDays: current.activeDays.includes(day)
          ? current.activeDays
          : [...current.activeDays, day].slice(-30),
      };
    });
  }

  function changeView(next: View) {
    setGlossaryReturnView(null);
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openGlossaryConcept(id: string) {
    if (view !== "glossary") setGlossaryReturnView(view);
    setGlossaryQuery("");
    setGlossaryCategory("Tout");
    setOpenConceptId(id);
    setView("glossary");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function returnFromGlossary() {
    if (!glossaryReturnView) return;
    const destination = glossaryReturnView;
    setGlossaryReturnView(null);
    setView(destination);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function launchMission(id: string) {
    setActiveMissionId(id);
    setMissionStep(0);
    setMissionChoice(null);
    setMissionScore(0);
    setView("missions");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openDailyMission(id: string) {
    const index = DAILY_PROGRAM.findIndex((mission) => mission.id === id);
    if (index < 0) return;
    if (index >= availableDailyCount) {
      setNotice(
        rawProgramIndex < 0
          ? `La première mission s’ouvre le ${formatProgramDate(0, true)}`
          : "Cette mission n’est pas encore ouverte",
      );
      return;
    }
    const mission = DAILY_PROGRAM[index];
    setSelectedDailyId(id);
    setDailyQuiz(buildDailyQuiz(progress, mission, index));
    setDailyQuizIndex(0);
    setDailyChoice(null);
    setDailyScore(0);
    setDailyQuizDone(false);
    setView("daily");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openTodayMission() {
    if (!availableDailyCount) {
      changeView("daily");
      return;
    }
    openDailyMission(DAILY_PROGRAM[todayProgramIndex].id);
  }

  function updateDailyNotes(notes: string) {
    setProgress((current) => ({
      ...current,
      dailyMissions: {
        ...current.dailyMissions,
        [selectedDaily.id]: {
          ...(current.dailyMissions[selectedDaily.id] ?? { notes: "" }),
          notes,
        },
      },
    }));
  }

  function answerDailyQuestion(index: number) {
    if (!selectedDailyQuestion || dailyChoice !== null) return;
    setDailyChoice(index);
    const correct = index === selectedDailyQuestion.question.answer;
    if (correct) setDailyScore((score) => score + 1);
    recordAnswer([selectedDailyQuestion.conceptId], correct, 0.85);
  }

  function nextDailyQuestion() {
    const nextIndex = dailyQuizIndex + 1;
    if (nextIndex >= dailyQuiz.length) {
      setDailyQuizDone(true);
      setDailyChoice(null);
      return;
    }
    setDailyQuizIndex(nextIndex);
    setDailyChoice(null);
  }

  function completeDailyMission(confidence: DailyConfidence) {
    const now = currentTimestamp();
    const day = todayKey();
    setProgress((current) => {
      const existing = current.dailyMissions[selectedDaily.id] ?? { notes: "" };
      const concepts = { ...current.concepts };
      if (confidence === "difficile") {
        for (const id of selectedDaily.concepts) {
          const item = progressFor(current, id);
          if (!item.attempts) continue;
          concepts[id] = { ...item, nextReview: Math.min(item.nextReview, now + DAY) };
        }
      }
      return {
        ...current,
        concepts,
        xp: current.xp + (existing.completedAt ? 0 : 30),
        activeDays: current.activeDays.includes(day)
          ? current.activeDays
          : [...current.activeDays, day].slice(-30),
        dailyMissions: {
          ...current.dailyMissions,
          [selectedDaily.id]: {
            ...existing,
            completedAt: now,
            score: dailyScore,
            questions: dailyQuiz.length,
            confidence,
          },
        },
      };
    });
    setNotice("Mission du jour terminée · prochaine étape ajustée");
  }

  function chooseMissionAnswer(index: number) {
    if (!activeMission || missionChoice !== null) return;
    const option = activeMission.steps[missionStep].options[index];
    setMissionChoice(index);
    if (option.correct) setMissionScore((score) => score + 1);
    recordAnswer(option.concepts, option.correct, activeMission.difficulty);
  }

  function nextMissionStep() {
    if (!activeMission) return;
    if (missionStep < activeMission.steps.length - 1) {
      setMissionStep((step) => step + 1);
      setMissionChoice(null);
      return;
    }
    setProgress((current) => ({
      ...current,
      completedMissions: current.completedMissions.includes(activeMission.id)
        ? current.completedMissions
        : [...current.completedMissions, activeMission.id],
      xp: current.xp + 20,
    }));
    setNotice("Mission terminée · bilan ajouté à ta progression");
    setActiveMissionId(null);
    setMissionChoice(null);
  }

  function assessGlossary(knewIt: boolean) {
    recordAnswer([openConcept.id], knewIt, 0.55);
    setNotice(knewIt ? "Notion espacée pour plus tard" : "Notion ajoutée aux révisions proches");
    const currentIndex = filteredConcepts.findIndex((concept) => concept.id === openConcept.id);
    const next = filteredConcepts[(currentIndex + 1) % Math.max(filteredConcepts.length, 1)];
    if (next) setOpenConceptId(next.id);
  }

  function startReview() {
    const queue = buildReviewQueue(progress);
    const firstId = queue[0] ?? CONCEPTS[0].id;
    const variants = REVIEW_VARIANTS[firstId] ?? [CONCEPTS.find((item) => item.id === firstId)?.quiz ?? CONCEPTS[0].quiz];
    setReviewQueue(queue);
    setReviewIndex(0);
    setReviewVariantIndex(progressFor(progress, firstId).attempts % variants.length);
    setReviewChoice(null);
    setReviewDone(false);
    setReviewSessionScore(0);
    changeView("review");
  }

  function answerReview(index: number) {
    if (reviewChoice !== null) return;
    setReviewChoice(index);
    const correct = index === reviewQuestion.answer;
    if (correct) setReviewSessionScore((score) => score + 1);
    recordAnswer([reviewConcept.id], correct, 0.9);
  }

  function nextReview() {
    const nextIndex = reviewIndex + 1;
    if (nextIndex >= reviewQueue.length) {
      setReviewDone(true);
      setReviewChoice(null);
      return;
    }
    const nextId = reviewQueue[nextIndex];
    const nextConcept = CONCEPTS.find((item) => item.id === nextId) ?? CONCEPTS[0];
    const variants = REVIEW_VARIANTS[nextId] ?? [nextConcept.quiz];
    setReviewIndex(nextIndex);
    setReviewVariantIndex(progressFor(progress, nextId).attempts % variants.length);
    setReviewChoice(null);
  }

  function resetProgress() {
    if (!window.confirm("Effacer toute la progression enregistrée sur cet appareil ?")) return;
    setProgress(emptyProgress);
    setDailyQuiz(buildDailyQuiz(emptyProgress, selectedDaily, selectedDailyIndex));
    setDailyQuizIndex(0);
    setDailyChoice(null);
    setDailyScore(0);
    setDailyQuizDone(false);
    localStorage.removeItem(STORAGE_KEY);
    setNotice("Progression remise à zéro");
  }

  function recommendation() {
    if (rawProgramIndex < 0) {
      return {
        label: "Programme avant-rentrée",
        title: `Première mission ${formatProgramDate(0, true)}`,
        text: "Trente missions courtes sont prêtes. Chacune ajoute un exercice concret et un contrôle adapté à tes résultats.",
        action: "Voir le programme",
        onClick: () => changeView("daily"),
      };
    }
    if (rawProgramIndex < DAILY_PROGRAM.length) {
      const todayMission = DAILY_PROGRAM[todayProgramIndex];
      const todayDone = Boolean(progress.dailyMissions[todayMission.id]?.completedAt);
      if (!todayDone) {
        return {
          label: `Mission du jour · ${todayMission.phase}`,
          title: `Jour ${todayProgramIndex + 1} — ${todayMission.title}`,
          text: `${todayMission.duration}. Le contrôle renforcera en priorité ${adaptiveDailyFocus.term}, puis espacera ce qui tient déjà.`,
          action: "Ouvrir la mission du jour",
          onClick: openTodayMission,
        };
      }
      if (dailyBacklog.length) {
        const catchup = dailyBacklog[0];
        return {
          label: `${dailyBacklog.length} mission${dailyBacklog.length > 1 ? "s" : ""} à reprendre`,
          title: catchup.title,
          text: "La mission du jour est terminée. Tu peux reprendre un jour manqué sans casser la progression.",
          action: "Rattraper cette mission",
          onClick: () => openDailyMission(catchup.id),
        };
      }
      return {
        label: "Mission du jour terminée",
        title: "Les acquis ont été recalculés",
        text: "Tu peux t’arrêter là ou faire une courte révision ciblée. Demain ajoutera une nouvelle mission, pas une dette.",
        action: "Révision facultative",
        onClick: startReview,
      };
    }
    if (dailyBacklog.length) {
      const catchup = dailyBacklog[0];
      return {
        label: "Programme encore ouvert",
        title: catchup.title,
        text: "Les missions non faites restent accessibles dans l’ordre que tu préfères.",
        action: "Reprendre le programme",
        onClick: () => openDailyMission(catchup.id),
      };
    }
    if (!progress.answers) {
      return {
        label: "Commencer en douceur",
        title: "Ton premier diagnostic guidé",
        text: "Apprends la méthode en résolvant une panne d’affichage, sans prérequis et sans démontage sauvage.",
        action: "Lancer la mission",
        onClick: () => launchMission("no-display"),
      };
    }
    if (dueConcepts.length || weakConcepts.length) {
      const target = dueConcepts[0] ?? weakConcepts[0];
      return {
        label: "Renforcement conseillé",
        title: `${target.term} mérite un second passage`,
        text: "Une réponse récente montre que cette notion n’est pas encore automatique. Trois minutes suffisent pour la consolider.",
        action: "Faire une révision ciblée",
        onClick: startReview,
      };
    }
    const nextMission = MISSIONS.find(
      (mission) => !progress.completedMissions.includes(mission.id),
    );
    if (nextMission) {
      return {
        label: "Niveau suivant",
        title: nextMission.title,
        text: "Tes bases tiennent. On augmente maintenant le nombre d’hypothèses et la précision du diagnostic.",
        action: "Approfondir",
        onClick: () => launchMission(nextMission.id),
      };
    }
    return {
      label: "Entretien des acquis",
      title: "Une révision espacée de cinq minutes",
      text: "Le parcours est terminé, mais la mémoire adore prétendre que tout est définitivement acquis.",
      action: "Réviser",
      onClick: startReview,
    };
  }

  const recommended = recommendation();

  function renderConceptText(text: string, skipConceptId?: string) {
    return (
      <>
        {text.split(CONCEPT_LINK_PATTERN).map((part, index) => {
          const conceptId = CONCEPT_ALIAS_LOOKUP.get(part.toLocaleLowerCase("fr"));
          if (!conceptId || conceptId === skipConceptId) return part;
          const concept = CONCEPTS.find((item) => item.id === conceptId);
          return (
            <a
              key={`${conceptId}-${index}`}
              className="concept-link"
              href={`#glossaire-${conceptId}`}
              onClick={(event) => {
                event.preventDefault();
                openGlossaryConcept(conceptId);
              }}
              title={`Ouvrir la fiche « ${concept?.term ?? part} »`}
            >
              {part}
            </a>
          );
        })}
      </>
    );
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <button className="brand" onClick={() => changeView("dashboard")} aria-label="Retour au tableau de bord">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span>Atelier TI</span>
        </button>
        <nav className="main-nav" aria-label="Navigation principale">
          {(
            [
              ["dashboard", "Tableau de bord", "dashboard"],
              ["daily", "Programme", "calendar"],
              ["missions", "Missions", "missions"],
              ["glossary", "Glossaire", "glossary"],
              ["review", "Révisions", "review"],
              ["memos", "Fiches mémo", "memo"],
            ] as [View, string, string][]
          ).map(([id, label, icon]) => (
            <button
              key={id}
              className={view === id ? "nav-item active" : "nav-item"}
              onClick={() =>
                id === "review"
                  ? startReview()
                  : id === "daily"
                    ? openTodayMission()
                    : changeView(id)
              }
              aria-current={view === id ? "page" : undefined}
            >
              <Icon name={icon} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <button className="profile-chip" onClick={() => changeView("progress")}>
          <span className="avatar">N</span>
          <span className="profile-copy">
            <strong>Nicolas</strong>
            <small>{progress.xp} XP</small>
          </span>
          <Icon name="chart" size={19} />
        </button>
      </header>

      {view === "dashboard" && (
        <>
          <section className="hero notebook-section">
            <div className="hero-copy">
              <p className="kicker">Formation technicien informatique</p>
              <h1>
                Apprendre
                <br />
                en réparant
              </h1>
              <span className="ink-underline" aria-hidden="true" />
              <div className="mission-intro">
                <span>Mission recommandée</span>
                <h2>{recommended.title}</h2>
                <p>{recommended.text}</p>
              </div>
              <p className="hand-note">Pas à pas. À ton rythme. Avec méthode.</p>
              <button className="primary-cta" onClick={recommended.onClick}>
                <Icon name="missions" size={28} />
                {recommended.action}
                <Icon name="arrow" size={22} />
              </button>
            </div>

            <div className="hero-illustration" aria-label="Schéma d’un ordinateur relié à un écran">
              <span className="diagram-note note-one"><b>1</b> Observer</span>
              <img
                src="pc-monitor-diagnostic.png"
                width={1608}
                height={978}
                alt="Tour d’ordinateur, écran et câble vidéo dessinés comme dans un manuel technique"
              />
              <span className="diagram-note note-two"><b>2</b> Tester</span>
              <span className="diagram-note note-three"><b>3</b> Conclure</span>
              <div className="circuit-lines" aria-hidden="true" />
            </div>

            <aside className="hero-stats" aria-label="Progression">
              <article className="paper-card progress-card">
                <div className="card-band teal"><Icon name="chart" /></div>
                <div className="card-body">
                  <strong className="big-number">{masteredConcepts.length} <small>/ {CONCEPTS.length}</small></strong>
                  <span>notions solides</span>
                  <div className="progress-track" aria-label={`${masteredConcepts.length} notions solides sur ${CONCEPTS.length}`}>
                    <span style={{ width: `${(masteredConcepts.length / CONCEPTS.length) * 100}%` }} />
                  </div>
                  <small>{attemptedConcepts.length ? `${attemptedConcepts.length} déjà rencontrées` : "Le suivi commence à ta première réponse"}</small>
                </div>
              </article>
              <article className="paper-card focus-card">
                <div className="card-band mustard"><Icon name="review" /></div>
                <div className="card-body">
                  <span className="small-label">À travailler maintenant</span>
                  <strong>{weakConcepts.length ? weakConcepts.slice(0, 3).map((item) => item.term).join(" · ") : "Construire les premiers repères"}</strong>
                  <button onClick={startReview}>{dueConcepts.length || weakConcepts.length ? "Révision ciblée" : "Carte de départ"}</button>
                </div>
              </article>
              <article className="xp-card">
                <span className="stamp">XP</span>
                <strong>{progress.xp}</strong>
                <span>expérience acquise</span>
              </article>
            </aside>
          </section>

          <section className="content-section dashboard-grid">
            <div className="section-heading span-two">
              <div>
                <p className="kicker">Ta prochaine séance</p>
                <h2>Le site choisit selon tes résultats</h2>
              </div>
              <p>
                Une erreur rapproche la notion. Plusieurs réussites l’espacent et débloquent un cas plus exigeant.
              </p>
            </div>
            <article className="recommendation-card span-two">
              <div className="recommendation-number">{progress.answers ? "ADAPTÉ" : "DÉPART"}</div>
              <div>
                <span className="status-label">{recommended.label}</span>
                <h3>{recommended.title}</h3>
                <p>{recommended.text}</p>
              </div>
              <button className="secondary-cta" onClick={recommended.onClick}>
                {recommended.action}<Icon name="arrow" size={19} />
              </button>
            </article>
            <article className="method-card">
              <span className="index-tab">01</span>
              <Icon name="missions" size={30} />
              <h3>Diagnostiquer</h3>
              <p>Observer, formuler des hypothèses, tester une variable et vérifier le résultat.</p>
            </article>
            <article className="method-card">
              <span className="index-tab">02</span>
              <Icon name="glossary" size={30} />
              <h3>Nommer</h3>
              <p>Relier chaque mot technique à une fonction, un exemple et une confusion fréquente.</p>
            </article>
            <article className="method-card">
              <span className="index-tab">03</span>
              <Icon name="review" size={30} />
              <h3>Consolider</h3>
              <p>Revoir au bon moment ce qui hésite, plutôt que relire passivement tout le manuel.</p>
            </article>
          </section>
        </>
      )}

      {view === "daily" && (
        <section className="content-section page-section daily-section">
          <div className="page-title-row">
            <div>
              <p className="kicker">Du 25 juillet au 23 août</p>
              <h1>Programme avant-rentrée</h1>
              <p className="lede">
                Une mission courte par jour, un exercice concret et trois questions choisies selon tes résultats.
              </p>
            </div>
            <div className="annotation-card">
              <strong>{completedDailyCount} / {DAILY_PROGRAM.length}</strong>
              <span>missions terminées</span>
            </div>
          </div>

          {!availableDailyCount ? (
            <article className="program-waiting">
              <span className="summary-stamp">DÉPART LE 25 JUILLET</span>
              <p className="kicker">Le programme est prêt</p>
              <h2>La première mission s’ouvrira demain</h2>
              <p>
                Elle établira ton point de départ sans modifier ton PC. Ensuite, une mission
                s’ouvrira chaque jour jusqu’à la veille de ta rentrée.
              </p>
              <div className="program-preview-grid">
                {(["Fondations", "Windows", "Réseau", "Support sûr", "Synthèse"] as const).map((phase) => (
                  <div key={phase}>
                    <strong>{phase}</strong>
                    <span>{DAILY_PROGRAM.filter((mission) => mission.phase === phase).length} mission(s)</span>
                  </div>
                ))}
              </div>
            </article>
          ) : (
            <div className="daily-layout">
              <aside className="daily-index">
                <div className="daily-index-head">
                  <span className="folder-tab">30 JOURS · {PROGRAM_START} → {PROGRAM_END}</span>
                  <h2>Le parcours</h2>
                  <p>
                    {dailyBacklog.length
                      ? `${dailyBacklog.length} mission${dailyBacklog.length > 1 ? "s" : ""} ouverte${dailyBacklog.length > 1 ? "s" : ""} reste${dailyBacklog.length > 1 ? "nt" : ""} à faire.`
                      : "Toutes les missions ouvertes sont terminées."}
                  </p>
                  <div className="program-meter">
                    <span style={{ width: `${(completedDailyCount / DAILY_PROGRAM.length) * 100}%` }} />
                  </div>
                </div>
                <div className="daily-day-list">
                  {DAILY_PROGRAM.map((mission, index) => {
                    const available = index < availableDailyCount;
                    const completed = Boolean(progress.dailyMissions[mission.id]?.completedAt);
                    return (
                      <button
                        key={mission.id}
                        className={`${mission.id === selectedDaily.id ? "current" : ""} ${completed ? "completed" : ""}`}
                        onClick={() => openDailyMission(mission.id)}
                        disabled={!available}
                      >
                        <span className="daily-day-number">{String(index + 1).padStart(2, "0")}</span>
                        <span>
                          <small>{available ? `${formatProgramDate(index)} · ${mission.phase}` : `${formatProgramDate(index)} · à venir`}</small>
                          <strong>{available ? mission.title : "Mission verrouillée"}</strong>
                        </span>
                        {completed ? <Icon name="check" size={18} /> : available ? <Icon name="arrow" size={17} /> : null}
                      </button>
                    );
                  })}
                </div>
              </aside>

              <article className="daily-sheet">
                <div className="daily-sheet-head">
                  <div>
                    <div className="tag-row">
                      <span>Jour {selectedDailyIndex + 1}</span>
                      <span>{formatProgramDate(selectedDailyIndex, true)}</span>
                      <span>{selectedDaily.duration}</span>
                      <span className="adaptive-tag">{dailyMode}</span>
                    </div>
                    <p className="kicker">{selectedDaily.phase}</p>
                    <h2>{selectedDaily.title}</h2>
                  </div>
                  {selectedDailyRecord.completedAt ? (
                    <div className="daily-complete-stamp">
                      <Icon name="check" size={22} />
                      <span>Terminée</span>
                      <small>{selectedDailyRecord.score ?? 0}/{selectedDailyRecord.questions ?? 0} au contrôle</small>
                    </div>
                  ) : (
                    <div className="daily-number">{String(selectedDailyIndex + 1).padStart(2, "0")}</div>
                  )}
                </div>

                <div className="adaptive-strip">
                  <div>
                    <span>Renfort calculé</span>
                    <strong>{adaptiveDailyFocus.term}</strong>
                  </div>
                  <p>
                    {progressFor(progress, adaptiveDailyFocus.id).attempts
                      ? `${progressFor(progress, adaptiveDailyFocus.id).strength} % de solidité : cette notion a besoin d’un autre contexte.`
                      : "Cette notion n’a pas encore été testée : le contrôle établira un premier repère."}
                  </p>
                  <button onClick={() => openGlossaryConcept(adaptiveDailyFocus.id)}>Ouvrir la fiche</button>
                </div>

                <section className="daily-objective">
                  <span>Objectif</span>
                  <p>{renderConceptText(selectedDaily.objective)}</p>
                </section>

                <section className="daily-block">
                  <p className="kicker">01 · Comprendre</p>
                  <h3>Briefing</h3>
                  <ul>
                    {selectedDaily.briefing.map((item) => <li key={item}>{renderConceptText(item)}</li>)}
                  </ul>
                </section>

                <section className="daily-block practical">
                  <p className="kicker">02 · Faire</p>
                  <h3>Mission pratique</h3>
                  <ol>
                    {selectedDaily.tasks.map((task) => <li key={task}>{renderConceptText(task)}</li>)}
                  </ol>
                  {selectedDaily.commands?.length ? (
                    <div className="daily-commands">
                      {selectedDaily.commands.map((item) => (
                        <div key={item.command}>
                          <code>{item.command}</code>
                          <span>{renderConceptText(item.purpose)}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <div className="daily-evidence">
                    <b>Trace à conserver</b>
                    <span>{renderConceptText(selectedDaily.evidence)}</span>
                  </div>
                  <div className="daily-challenge">
                    <b>Si c’est déjà solide</b>
                    <span>{renderConceptText(selectedDaily.challenge)}</span>
                  </div>
                  {selectedDaily.caution ? (
                    <p className="daily-caution"><b>Prudence :</b> {renderConceptText(selectedDaily.caution)}</p>
                  ) : null}
                </section>

                <section className="daily-notes">
                  <label htmlFor="daily-notes">
                    <span>Notes de mission</span>
                    <small>Enregistrées sur cet appareil</small>
                  </label>
                  <textarea
                    id="daily-notes"
                    value={selectedDailyRecord.notes}
                    onChange={(event) => updateDailyNotes(event.target.value)}
                    placeholder="Observations, réponse demandée, point encore flou…"
                    rows={6}
                  />
                </section>

                <div className="daily-resources">
                  {selectedDaily.memoId ? (
                    <button className="secondary-cta" onClick={() => {
                      setActiveMemoId(selectedDaily.memoId ?? MEMOS[0].id);
                      changeView("memos");
                    }}>
                      Ouvrir la fiche mémo
                    </button>
                  ) : null}
                  {selectedDaily.relatedMissionId ? (
                    <button className="secondary-cta" onClick={() => launchMission(selectedDaily.relatedMissionId ?? MISSIONS[0].id)}>
                      Lancer le cas interactif
                    </button>
                  ) : null}
                </div>

                <section className="daily-check">
                  <div className="daily-check-head">
                    <div>
                      <p className="kicker">03 · Vérifier sans relire</p>
                      <h3>Contrôle adaptatif</h3>
                    </div>
                    <span>{dailyQuizDone ? dailyScore : Math.min(dailyQuizIndex + 1, dailyQuiz.length)} / {dailyQuiz.length}</span>
                  </div>
                  {!dailyQuizDone && selectedDailyQuestion && selectedDailyConcept ? (
                    <>
                      <div className="quiz-meta">
                        <span className="status-label">{selectedDailyConcept.category}</span>
                        <span>{selectedDailyConcept.term}</span>
                      </div>
                      <h4>{selectedDailyQuestion.question.question}</h4>
                      <div className="answer-list">
                        {selectedDailyQuestion.question.options.map((option, index) => {
                          const chosen = dailyChoice === index;
                          const correct = index === selectedDailyQuestion.question.answer;
                          const state = dailyChoice === null ? "" : correct ? "correct" : chosen ? "wrong" : "muted";
                          return (
                            <button
                              key={option}
                              className={`answer-option ${state}`}
                              disabled={dailyChoice !== null}
                              onClick={() => answerDailyQuestion(index)}
                            >
                              <span>{String.fromCharCode(65 + index)}</span>
                              <strong>{option}</strong>
                              {dailyChoice !== null && correct && <Icon name="check" size={19} />}
                              {chosen && !correct && <Icon name="close" size={19} />}
                            </button>
                          );
                        })}
                      </div>
                      {dailyChoice !== null ? (
                        <div className={dailyChoice === selectedDailyQuestion.question.answer ? "feedback correct" : "feedback wrong"}>
                          <strong>{dailyChoice === selectedDailyQuestion.question.answer ? "Exact" : "À reprendre"}</strong>
                          <p>{renderConceptText(selectedDailyQuestion.question.explanation)}</p>
                          <button className="primary-cta compact" onClick={nextDailyQuestion}>
                            {dailyQuizIndex === dailyQuiz.length - 1 ? "Voir le bilan" : "Question suivante"}
                            <Icon name="arrow" size={19} />
                          </button>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="daily-check-summary">
                      <span className="summary-stamp">CONTRÔLE TERMINÉ</span>
                      <h4>{dailyScore} réponse{dailyScore > 1 ? "s" : ""} juste{dailyScore > 1 ? "s" : ""} sur {dailyQuiz.length}</h4>
                      <p>Comment la mission t’a-t-elle paru ? Ce ressenti règle la proximité du prochain rappel.</p>
                      <div className="confidence-buttons">
                        <button onClick={() => completeDailyMission("trop-facile")}>Trop facile</button>
                        <button onClick={() => completeDailyMission("juste")}>Au bon niveau</button>
                        <button onClick={() => completeDailyMission("difficile")}>Encore difficile</button>
                      </div>
                    </div>
                  )}
                </section>
              </article>
            </div>
          )}
        </section>
      )}

      {view === "missions" && !activeMission && (
        <section className="content-section page-section">
          <div className="page-title-row">
            <div>
              <p className="kicker">Cas pratiques</p>
              <h1>Missions de diagnostic</h1>
              <p className="lede">Chaque panne t’apprend une méthode transférable, pas une recette à réciter.</p>
            </div>
            <div className="annotation-card">
              <strong>{progress.completedMissions.length} / {MISSIONS.length}</strong>
              <span>missions terminées</span>
            </div>
          </div>
          <div className="mission-list">
            {MISSIONS.map((mission, index) => {
              const completed = progress.completedMissions.includes(mission.id);
              const conceptStrengths = mission.concepts.map((id) => progressFor(progress, id).strength);
              const average = conceptStrengths.length
                ? Math.round(conceptStrengths.reduce((sum, value) => sum + value, 0) / conceptStrengths.length)
                : 0;
              return (
                <article className={completed ? "mission-card completed" : "mission-card"} key={mission.id}>
                  <div className="mission-index">{String(index + 1).padStart(2, "0")}</div>
                  <div className="mission-main">
                    <span className="status-label">{mission.eyebrow}</span>
                    <h2>{mission.title}</h2>
                    <p>{mission.description}</p>
                    <div className="tag-row">
                      <span>{mission.duration}</span>
                      <span>Difficulté {"●".repeat(mission.difficulty)}{"○".repeat(3 - mission.difficulty)}</span>
                      {completed && <span className="success-tag"><Icon name="check" size={15} /> Terminée</span>}
                    </div>
                  </div>
                  <div className="mission-side">
                    <div className="mini-meter"><span style={{ width: `${average}%` }} /></div>
                    <small>{average ? `${average} % de solidité sur les notions liées` : "Notions encore neuves"}</small>
                    <button className="secondary-cta" onClick={() => launchMission(mission.id)}>
                      {completed ? "Rejouer" : "Commencer"}<Icon name="arrow" size={18} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {view === "missions" && activeMission && (
        <section className="content-section diagnostic-section">
          <button className="text-button" onClick={() => setActiveMissionId(null)}>← Retour aux missions</button>
          <div className="diagnostic-header">
            <div>
              <span className="status-label">{activeMission.eyebrow} · Étape {missionStep + 1}/{activeMission.steps.length}</span>
              <h1>{activeMission.title}</h1>
            </div>
            <div className="step-dots" aria-label={`Étape ${missionStep + 1} sur ${activeMission.steps.length}`}>
              {activeMission.steps.map((_, index) => (
                <span key={index} className={index < missionStep ? "done" : index === missionStep ? "current" : ""} />
              ))}
            </div>
          </div>
          <div className="diagnostic-layout">
            <aside className="case-file">
              <span className="folder-tab">DOSSIER {activeMission.id.toUpperCase()}</span>
              <h2>Symptôme rapporté</h2>
              <p>{activeMission.description}</p>
              <hr />
              <h3>Règle d’atelier</h3>
              <p>Une hypothèse n’est pas une conclusion. Cherche le test qui permet de les distinguer.</p>
              <div className="score-note">
                <strong>{missionScore}</strong>
                <span>bonnes décisions</span>
              </div>
            </aside>
            <article className="question-sheet">
              <span className="question-number">{String(missionStep + 1).padStart(2, "0")}</span>
              <p className="kicker">{activeMission.steps[missionStep].title}</p>
              <h2>{activeMission.steps[missionStep].prompt}</h2>
              <p className="decision-hint">Plusieurs actions pourraient sembler défendables. Choisis celle qui apporte maintenant le plus d’information, avec le moins de risque et de modifications.</p>
              <div className="answer-list">
                {activeMission.steps[missionStep].options.map((option, index) => {
                  const chosen = missionChoice === index;
                  const state =
                    missionChoice === null
                      ? ""
                      : chosen
                        ? option.correct
                          ? "correct"
                          : "wrong"
                        : option.correct
                          ? "answer-key"
                          : "muted";
                  return (
                    <button
                      key={option.label}
                      className={`answer-option ${state}`}
                      onClick={() => chooseMissionAnswer(index)}
                      disabled={missionChoice !== null}
                    >
                      <span>{String.fromCharCode(65 + index)}</span>
                      <strong>{option.label}</strong>
                      {missionChoice !== null && option.correct && <Icon name="check" size={19} />}
                      {chosen && !option.correct && <Icon name="close" size={19} />}
                    </button>
                  );
                })}
              </div>
              {missionChoice !== null && (
                <div className={activeMission.steps[missionStep].options[missionChoice].correct ? "feedback correct" : "feedback wrong"}>
                  <strong>{activeMission.steps[missionStep].options[missionChoice].correct ? "Bonne piste" : "À reprendre"}</strong>
                  <p>{renderConceptText(activeMission.steps[missionStep].options[missionChoice].feedback)}</p>
                  <div className="takeaway"><b>À retenir</b><span>{renderConceptText(activeMission.steps[missionStep].takeaway)}</span></div>
                  <button className="primary-cta compact" onClick={nextMissionStep}>
                    {missionStep === activeMission.steps.length - 1 ? "Terminer la mission" : "Étape suivante"}
                    <Icon name="arrow" size={19} />
                  </button>
                </div>
              )}
            </article>
          </div>
        </section>
      )}

      {view === "glossary" && (
        <section className="content-section page-section glossary-section">
          {glossaryReturnView && (
            <button className="text-button glossary-return" onClick={returnFromGlossary}>
              ← Retour {glossaryReturnView === "missions"
                ? "à la mission"
                : glossaryReturnView === "daily"
                  ? "au programme"
                : glossaryReturnView === "review"
                  ? "à la révision"
                  : glossaryReturnView === "memos"
                    ? "à la fiche mémo"
                    : glossaryReturnView === "progress"
                      ? "à la progression"
                      : "au tableau de bord"}
            </button>
          )}
          <div className="page-title-row">
            <div>
              <p className="kicker">Les mots utiles, enfin reliés à quelque chose</p>
              <h1>Glossaire actif</h1>
              <p className="lede">Définition courte, usage concret, piège fréquent, puis rappel actif.</p>
            </div>
            <div className="annotation-card">
              <strong>{attemptedConcepts.length} / {CONCEPTS.length}</strong>
              <span>notions rencontrées</span>
            </div>
          </div>
          <div className="glossary-controls">
            <label className="search-box">
              <Icon name="search" size={20} />
              <span className="sr-only">Rechercher dans le glossaire</span>
              <input
                value={glossaryQuery}
                onChange={(event) => setGlossaryQuery(event.target.value)}
                placeholder="Rechercher un terme, une fonction…"
              />
            </label>
            <div className="filter-tabs" aria-label="Filtrer par catégorie">
              {(["Tout", ...CATEGORY_ORDER] as const).map((category) => (
                <button
                  key={category}
                  className={glossaryCategory === category ? "active" : ""}
                  onClick={() => setGlossaryCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="glossary-layout">
            <div className="term-list" aria-label="Liste des termes">
              {filteredConcepts.map((concept) => {
                const item = progressFor(progress, concept.id);
                return (
                  <button
                    key={concept.id}
                    onClick={() => setOpenConceptId(concept.id)}
                    className={openConcept.id === concept.id ? "term-row active" : "term-row"}
                  >
                    <span className={`category-dot ${concept.category.toLocaleLowerCase("fr")}`} />
                    <span><strong>{concept.term}</strong><small>{concept.short}</small></span>
                    <em className={`level level-${levelLabel(item.strength, item.attempts).replaceAll(" ", "-").toLocaleLowerCase("fr")}`}>
                      {levelLabel(item.strength, item.attempts)}
                    </em>
                  </button>
                );
              })}
              {!filteredConcepts.length && <p className="empty-state">Aucun terme ne correspond à cette recherche.</p>}
            </div>
            <article className="definition-sheet" id={`glossaire-${openConcept.id}`}>
              <div className="definition-head">
                <span className="status-label">{openConcept.category}</span>
                <span className="strength-chip">
                  {progressFor(progress, openConcept.id).strength} % · {levelLabel(progressFor(progress, openConcept.id).strength, progressFor(progress, openConcept.id).attempts)}
                </span>
              </div>
              <h2>{openConcept.term}</h2>
              {openEnrichment?.expansion && (
                <p className="term-expansion">{openEnrichment.expansion}</p>
              )}
              <p className="definition-short">{openConcept.short}</p>
              <div className="definition-block">
                <h3>En clair</h3>
                <p>{renderConceptText(openConcept.definition, openConcept.id)}</p>
              </div>
              {openEnrichment && (
                <>
                  <div className="definition-block mechanism">
                    <h3>Comment ça fonctionne</h3>
                    <ol>
                      {openEnrichment.mechanism.map((step) => <li key={step}>{renderConceptText(step, openConcept.id)}</li>)}
                    </ol>
                  </div>
                  <div className="definition-block history">
                    <h3>D’où ça vient</h3>
                    <p>{renderConceptText(openEnrichment.history, openConcept.id)}</p>
                  </div>
                </>
              )}
              <div className="definition-block example">
                <h3>Sur le terrain</h3>
                <p>{renderConceptText(openConcept.example, openConcept.id)}</p>
                {openEnrichment && (
                  <ul className="field-notes">
                    {openEnrichment.fieldNotes.map((note) => <li key={note}>{renderConceptText(note, openConcept.id)}</li>)}
                  </ul>
                )}
              </div>
              <div className="definition-block warning">
                <h3>À ne pas confondre</h3>
                <p>{renderConceptText(openConcept.confusion, openConcept.id)}</p>
              </div>
              {openEnrichment && (
                <div className="related-concepts">
                  <span>Notions liées</span>
                  <div>
                    {openEnrichment.related.map((id) => {
                      const related = CONCEPTS.find((item) => item.id === id);
                      return related ? (
                        <button key={id} onClick={() => setOpenConceptId(id)}>{related.term}</button>
                      ) : null;
                    })}
                  </div>
                  {openEnrichment.sources?.length ? (
                    <small>
                      Sources techniques : {openEnrichment.sources.map((source, index) => (
                        <span key={source.url}>{index ? " · " : ""}<a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></span>
                      ))}
                    </small>
                  ) : null}
                </div>
              )}
              <div className="self-assessment">
                <span>Sans relire : pourrais-tu l’expliquer à quelqu’un ?</span>
                <div>
                  <button onClick={() => assessGlossary(false)}>Pas encore</button>
                  <button onClick={() => assessGlossary(true)}>Oui, clairement</button>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      {view === "review" && (
        <section className="content-section page-section review-section">
          <div className="page-title-row">
            <div>
              <p className="kicker">Séance adaptative</p>
              <h1>Révision ciblée</h1>
              <p className="lede">Le choix des questions dépend de tes erreurs, de ta solidité et du temps écoulé.</p>
            </div>
            <div className="annotation-card">
              <strong>{reviewDone ? reviewSessionScore : reviewIndex + 1} / {reviewQueue.length || 8}</strong>
              <span>{reviewDone ? "réponses justes" : "question de la séance"}</span>
            </div>
          </div>
          {!reviewDone ? (
            <div className="review-layout">
              <aside className="review-queue">
                <span className="folder-tab">SÉANCE DE {reviewQueue.length || 8} NOTIONS</span>
                <h2>Pourquoi cette notion ?</h2>
                <p>
                  {progressFor(progress, reviewConcept.id).attempts === 0
                    ? "Elle n’a pas encore été testée : le site établit ton point de départ."
                    : progressFor(progress, reviewConcept.id).strength < 50
                      ? "Elle a produit une hésitation ou une erreur récente : elle revient plus tôt."
                      : "Elle est déjà correcte : ce rappel vérifie qu’elle résiste au temps."}
                </p>
                <div className="session-track" aria-label={`Question ${reviewIndex + 1} sur ${reviewQueue.length}`}>
                  {reviewQueue.map((id, index) => (
                    <span key={id} className={index < reviewIndex ? "done" : index === reviewIndex ? "current" : ""} />
                  ))}
                </div>
                <p className="queue-note">Aucune notion ne revient avant la fin de cette séance. Les formulations alternent lors des passages suivants.</p>
                <div className="queue-stats">
                  <div><strong>{weakConcepts.length}</strong><span>à renforcer</span></div>
                  <div><strong>{masteredConcepts.length}</strong><span>solides</span></div>
                </div>
              </aside>
              <article className="quiz-sheet">
                <div className="quiz-meta">
                  <span className="status-label">{reviewConcept.category}</span>
                  <span>{reviewConcept.term}</span>
                </div>
                <h2>{reviewQuestion.question}</h2>
                <div className="answer-list">
                  {reviewQuestion.options.map((option, index) => {
                    const chosen = reviewChoice === index;
                    const correct = index === reviewQuestion.answer;
                    const state = reviewChoice === null ? "" : correct ? "correct" : chosen ? "wrong" : "muted";
                    return (
                      <button
                        key={option}
                        className={`answer-option ${state}`}
                        disabled={reviewChoice !== null}
                        onClick={() => answerReview(index)}
                      >
                        <span>{String.fromCharCode(65 + index)}</span>
                        <strong>{option}</strong>
                        {reviewChoice !== null && correct && <Icon name="check" size={19} />}
                        {chosen && !correct && <Icon name="close" size={19} />}
                      </button>
                    );
                  })}
                </div>
                {reviewChoice !== null && (
                  <div className={reviewChoice === reviewQuestion.answer ? "feedback correct" : "feedback wrong"}>
                    <strong>{reviewChoice === reviewQuestion.answer ? "Exact" : "À examiner"}</strong>
                    <p>{renderConceptText(reviewQuestion.explanation)}</p>
                    <button className="primary-cta compact" onClick={nextReview}>
                      {reviewIndex === reviewQueue.length - 1 ? "Voir le bilan" : "Question suivante"}
                      <Icon name="arrow" size={19} />
                    </button>
                  </div>
                )}
              </article>
            </div>
          ) : (
            <article className="review-summary">
              <span className="summary-stamp">SÉANCE TERMINÉE</span>
              <p className="kicker">Bilan immédiat</p>
              <h2>{reviewSessionScore} réponse{reviewSessionScore > 1 ? "s" : ""} juste{reviewSessionScore > 1 ? "s" : ""} sur {reviewQueue.length}</h2>
              <p>Les erreurs reviennent plus tôt dans une prochaine séance. Les réussites sont espacées et changeront de formulation.</p>
              <div>
                <button className="secondary-cta" onClick={() => changeView("progress")}>Voir la carte des acquis</button>
                <button className="primary-cta compact" onClick={startReview}>Nouvelle séance<Icon name="arrow" size={19} /></button>
              </div>
            </article>
          )}
        </section>
      )}

      {view === "memos" && (
        <section className="content-section page-section memos-section">
          <div className="page-title-row">
            <div>
              <p className="kicker">À garder sous la main</p>
              <h1>Fiches mémo</h1>
              <p className="lede">Des procédures courtes à consulter pendant un exercice ou à imprimer pour l’atelier.</p>
            </div>
            <button className="secondary-cta print-button" onClick={() => window.print()}>
              Imprimer la fiche active
            </button>
          </div>
          <div className="memos-layout">
            <aside className="memo-index">
              {MEMOS.map((memo, index) => (
                <button
                  key={memo.id}
                  className={memo.id === activeMemo.id ? "active" : ""}
                  onClick={() => setActiveMemoId(memo.id)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span><strong>{memo.title}</strong><small>{memo.duration} · {memo.tags.join(" · ")}</small></span>
                </button>
              ))}
            </aside>
            <article className="memo-sheet" data-print-sheet>
              <div className="memo-sheet-head">
                <div>
                  <span className="status-label">Fiche mémo · {activeMemo.duration}</span>
                  <h2>{activeMemo.title}</h2>
                  <p>{renderConceptText(activeMemo.subtitle)}</p>
                </div>
                <span className="memo-number">{String(MEMOS.findIndex((memo) => memo.id === activeMemo.id) + 1).padStart(2, "0")}</span>
              </div>
              <div className="memory-line"><b>À mémoriser</b><span>{renderConceptText(activeMemo.reminder)}</span></div>
              {activeMemo.sections.map((section) => (
                <section className="memo-section" key={section.title}>
                  <h3>{section.title}</h3>
                  {section.intro && <p>{renderConceptText(section.intro)}</p>}
                  {section.steps && (
                    <ol>{section.steps.map((step) => <li key={step}>{renderConceptText(step)}</li>)}</ol>
                  )}
                  {section.commands && (
                    <div className="command-list">
                      {section.commands.map((item) => (
                        <div key={item.command}><code>{item.command}</code><span>{renderConceptText(item.purpose)}</span></div>
                      ))}
                    </div>
                  )}
                  {section.warning && <p className="memo-warning">{renderConceptText(section.warning)}</p>}
                </section>
              ))}
              <footer className="memo-footer">Atelier TI · fiche {activeMemo.title}</footer>
            </article>
          </div>
        </section>
      )}

      {view === "progress" && (
        <section className="content-section page-section progress-section">
          <div className="page-title-row">
            <div>
              <p className="kicker">Données enregistrées sur cet appareil</p>
              <h1>Ta progression</h1>
              <p className="lede">Une lecture honnête de ce qui est neuf, fragile, en progrès ou déjà solide.</p>
            </div>
            <button className="text-button danger" onClick={resetProgress}>Remettre à zéro</button>
          </div>
          <div className="summary-grid">
            <article><span>Réponses</span><strong>{progress.answers}</strong><small>{accuracy} % correctes</small></article>
            <article><span>Notions solides</span><strong>{masteredConcepts.length}</strong><small>sur {CONCEPTS.length}</small></article>
            <article><span>Programme</span><strong>{completedDailyCount}</strong><small>sur {DAILY_PROGRAM.length} jours</small></article>
            <article><span>Cas interactifs</span><strong>{progress.completedMissions.length}</strong><small>sur {MISSIONS.length}</small></article>
            <article><span>Expérience</span><strong>{progress.xp}</strong><small>XP</small></article>
          </div>
          <div className="mastery-sheet">
            <div className="mastery-head">
              <div><p className="kicker">Carte des acquis</p><h2>Solidité par notion</h2></div>
              <div className="legend"><span className="weak">À renforcer</span><span className="growing">En progrès</span><span className="strong">Solide</span></div>
            </div>
            {CATEGORY_ORDER.map((category) => (
              <div className="category-progress" key={category}>
                <h3>{category}</h3>
                <div className="concept-bars">
                  {CONCEPTS.filter((concept) => concept.category === category).map((concept) => {
                    const item = progressFor(progress, concept.id);
                    return (
                      <button key={concept.id} onClick={() => openGlossaryConcept(concept.id)}>
                        <span><strong>{concept.term}</strong><em>{levelLabel(item.strength, item.attempts)}</em></span>
                        <span className="bar"><i style={{ width: `${item.strength}%` }} /></span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer>
        <span>Atelier TI · apprendre à raisonner, pas à cliquer au hasard</span>
        <button onClick={() => changeView("progress")}>Progression locale</button>
      </footer>

      {notice && <div className="toast" role="status">{notice}</div>}
    </main>
  );
}
