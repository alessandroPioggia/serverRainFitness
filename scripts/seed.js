const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Exercise = require('../models/Exercise');

const sampleExercises = [
    // PETTO (CHEST)
    {
        name: "Panca Piana",
        level: "intermediate",
        category: "chest",
        description: "Esercizio base per lo sviluppo dei pettorali",
        equipment: ["bilanciere", "panca piana"],
        primaryMuscles: ["pettorali"],
        secondaryMuscles: ["tricipiti", "deltoidi anteriori"],
        instructions: [
            "Sdraiati sulla panca con i piedi ben piantati a terra",
            "Impugna il bilanciere con una presa leggermente più larga delle spalle",
            "Abbassa il bilanciere al petto controllatamente",
            "Spingi il bilanciere verso l'alto fino a braccia tese"
        ],
        tips: ["Mantieni i gomiti a 45 gradi", "Respira in modo controllato"]
    },
    {
        name: "Push Up",
        level: "beginner",
        category: "chest",
        description: "Esercizio a corpo libero per petto e stabilità",
        equipment: [],
        primaryMuscles: ["pettorali"],
        secondaryMuscles: ["tricipiti", "deltoidi", "core"],
        instructions: [
            "Posizionati con le mani larghe quanto le spalle",
            "Mantieni il corpo allineato",
            "Abbassati flettendo i gomiti",
            "Risali spingendo con il petto"
        ],
        tips: ["Mantieni il core contratto", "Non alzare troppo il sedere"]
    },
    {
        name: "Panca Inclinata con Manubri",
        level: "intermediate",
        category: "chest",
        description: "Variante della panca che enfatizza la parte superiore del petto",
        equipment: ["manubri", "panca inclinata"],
        primaryMuscles: ["pettorali superiori"],
        secondaryMuscles: ["deltoidi anteriori", "tricipiti"],
        instructions: [
            "Regola la panca a 30-45 gradi",
            "Siediti con un manubrio in ogni mano sulle cosce",
            "Sdraiati portando i manubri all'altezza delle spalle",
            "Spingi i manubri verso l'alto mantenendoli allineati",
            "Abbassa controllando il movimento"
        ],
        tips: ["Mantieni i polsi dritti", "Non far toccare i manubri tra loro in alto"]
    },
    {
        name: "Dips per Pettorali",
        level: "intermediate",
        category: "chest",
        description: "Esercizio avanzato a corpo libero per petto e tricipiti",
        equipment: ["parallele"],
        primaryMuscles: ["pettorali inferiori", "tricipiti"],
        secondaryMuscles: ["deltoidi anteriori"],
        instructions: [
            "Afferra le parallele e sollevati",
            "Inclina il busto in avanti di circa 45 gradi",
            "Scendi flettendo i gomiti",
            "Spingi per tornare in alto"
        ],
        tips: ["Più ti inclini avanti, più lavora il petto", "Mantieni i gomiti stretti"]
    },
    {
        name: "Croci con Manubri",
        level: "intermediate",
        category: "chest",
        description: "Esercizio di isolamento per i pettorali",
        equipment: ["manubri", "panca piana"],
        primaryMuscles: ["pettorali"],
        secondaryMuscles: ["deltoidi anteriori"],
        instructions: [
            "Sdraiati sulla panca con un manubrio in ogni mano",
            "Braccia tese sopra il petto",
            "Abbassa lateralmente i manubri mantenendo una leggera flessione dei gomiti",
            "Risali con un movimento ad arco"
        ],
        tips: ["Mantieni la stessa angolazione dei gomiti", "Immagina di abbracciare un albero"]
    },
    {
        name: "Push Up Decline",
        level: "intermediate",
        category: "chest",
        description: "Variante dei piegamenti per enfatizzare i pettorali superiori",
        equipment: ["step"],
        primaryMuscles: ["pettorali superiori"],
        secondaryMuscles: ["tricipiti", "deltoidi", "core"],
        instructions: [
            "Posiziona i piedi su una superficie rialzata",
            "Mani a terra larghe quanto le spalle",
            "Abbassati mantenendo il corpo allineato",
            "Spingi per tornare su"
        ],
        tips: ["Più alto è il rialzo, più difficile sarà l'esercizio", "Mantieni il core contratto"]
    },
    {
        name: "Panca Piana con Manubri",
        level: "intermediate",
        category: "chest",
        description: "Variante della panca piana che permette maggior range di movimento",
        equipment: ["manubri", "panca piana"],
        primaryMuscles: ["pettorali"],
        secondaryMuscles: ["tricipiti", "deltoidi anteriori"],
        instructions: [
            "Sdraiati sulla panca con un manubrio in ogni mano",
            "Parti con i manubri all'altezza del petto",
            "Spingi i manubri verso l'alto mantenendoli paralleli",
            "Abbassa controllando il movimento fino al livello del petto"
        ],
        tips: ["Mantieni i polsi stabili", "Non far toccare i manubri tra loro"]
    },
    {
        name: "Panca Declinata",
        level: "intermediate",
        category: "chest",
        description: "Variante della panca che enfatizza la parte inferiore del petto",
        equipment: ["bilanciere", "panca declinata"],
        primaryMuscles: ["pettorali inferiori"],
        secondaryMuscles: ["tricipiti", "deltoidi anteriori"],
        instructions: [
            "Sdraiati sulla panca declinata con i piedi bloccati",
            "Impugna il bilanciere con presa media",
            "Abbassa il bilanciere verso la parte bassa del petto",
            "Spingi verso l'alto mantenendo i gomiti non completamente bloccati"
        ],
        tips: ["Mantieni le scapole retratte", "Non far rimbalzare il bilanciere sul petto"]
    },

    // SCHIENA (BACK)
    {
        name: "Stacco da Terra",
        level: "intermediate",
        category: "back",
        description: "Esercizio complesso per lo sviluppo totale del corpo",
        equipment: ["bilanciere"],
        primaryMuscles: ["dorsali", "glutei"],
        secondaryMuscles: ["quadricipiti", "femorali", "core"],
        instructions: [
            "Posizionati con i piedi alla larghezza delle spalle",
            "Afferra il bilanciere con presa mista o normale",
            "Tieni la schiena dritta e il petto in fuori",
            "Solleva il bilanciere mantenendo la barra vicina alle gambe"
        ],
        tips: ["Non arrotondare la schiena", "Inizia con pesi leggeri per perfezionare la tecnica"]
    },
    {
        name: "Lat Machine",
        level: "beginner",
        category: "back",
        description: "Esercizio isolato per lo sviluppo dei dorsali",
        equipment: ["lat machine"],
        primaryMuscles: ["dorsali"],
        secondaryMuscles: ["bicipiti", "romboidi"],
        instructions: [
            "Siediti alla lat machine con i piedi ben piantati",
            "Afferra la barra con presa larga",
            "Tira la barra verso il petto",
            "Controlla il movimento di ritorno"
        ],
        tips: ["Mantieni il petto in fuori", "Non dondolare con il corpo"]
    },
    {
        name: "Trazioni alla Sbarra",
        level: "intermediate",
        category: "back",
        description: "Esercizio fondamentale per lo sviluppo della schiena",
        equipment: ["sbarra trazioni"],
        primaryMuscles: ["dorsali", "trapezio inferiore"],
        secondaryMuscles: ["bicipiti", "romboidi", "deltoidi posteriori"],
        instructions: [
            "Impugna la sbarra con presa prona più larga delle spalle",
            "Partendo da braccia distese, tirati su fino a portare il mento sopra la sbarra",
            "Scendi controllando il movimento fino a braccia tese",
            "Ripeti mantenendo la tensione nei dorsali"
        ],
        tips: ["Non oscillare", "Concentrati sulla contrazione dei dorsali"]
    },
    {
        name: "Rematore con Bilanciere",
        level: "intermediate",
        category: "back",
        description: "Esercizio composto per spessore della schiena",
        equipment: ["bilanciere"],
        primaryMuscles: ["dorsali", "trapezio"],
        secondaryMuscles: ["bicipiti", "deltoidi posteriori", "core"],
        instructions: [
            "Piega il busto in avanti mantenendo la schiena dritta",
            "Impugna il bilanciere con presa prona",
            "Tira il bilanciere verso l'ombelico",
            "Abbassa controllando il movimento"
        ],
        tips: ["Mantieni gli addominali contratti", "Tira con i gomiti, non con le mani"]
    },
    {
        name: "Pull Down Dietro la Nuca",
        level: "advanced",
        category: "back",
        description: "Variante della lat machine per enfatizzare l'ampiezza dei dorsali",
        equipment: ["lat machine"],
        primaryMuscles: ["dorsali"],
        secondaryMuscles: ["bicipiti", "trapezio"],
        instructions: [
            "Impugna la barra larga con presa prona",
            "Tira la barra dietro la nuca",
            "Controlla il movimento di risalita",
            "Mantieni il busto eretto"
        ],
        tips: ["Attenzione alla posizione del collo", "Non esagerare con il peso"]
    },
    {
        name: "Pulley Basso",
        level: "beginner",
        category: "back",
        description: "Esercizio per lo spessore della schiena bassa",
        equipment: ["cavo basso", "maniglia"],
        primaryMuscles: ["dorsali", "trapezio inferiore"],
        secondaryMuscles: ["bicipiti", "deltoidi posteriori"],
        instructions: [
            "Siediti di fronte al pulley con i piedi sulla piattaforma",
            "Afferra la maniglia con presa neutra",
            "Tira verso l'ombelico mantenendo la schiena dritta",
            "Ritorna controllando il movimento"
        ],
        tips: ["Non dondolare con il corpo", "Contrai le scapole alla fine del movimento"]
    },
    {
        name: "Good Morning",
        level: "advanced",
        category: "back",
        description: "Esercizio per lombari e catena posteriore",
        equipment: ["bilanciere"],
        primaryMuscles: ["lombari", "femorali"],
        secondaryMuscles: ["glutei", "trapezio"],
        instructions: [
            "Posiziona il bilanciere sulle spalle",
            "Piedi alla larghezza delle spalle",
            "Piega il busto in avanti mantenendo la schiena dritta",
            "Risali contraendo i muscoli della schiena"
        ],
        tips: ["Non arrotondare mai la schiena", "Mantieni le ginocchia leggermente piegate"]
    },

    // GAMBE (LEGS)
    {
        name: "Squat",
        level: "intermediate",
        category: "legs",
        description: "Re degli esercizi per le gambe",
        equipment: ["bilanciere", "rack"],
        primaryMuscles: ["quadricipiti", "glutei"],
        secondaryMuscles: ["femorali", "core"],
        instructions: [
            "Posiziona il bilanciere sulle spalle",
            "Piedi larghi quanto le spalle",
            "Scendi controllando il movimento",
            "Risali spingendo sui talloni"
        ],
        tips: ["Mantieni i talloni a terra", "Guarda avanti"]
    },
    {
        name: "Leg Press",
        level: "beginner",
        category: "legs",
        description: "Esercizio base per lo sviluppo delle gambe",
        equipment: ["leg press"],
        primaryMuscles: ["quadricipiti", "glutei"],
        secondaryMuscles: ["femorali"],
        instructions: [
            "Siediti nella macchina con la schiena ben aderente",
            "Posiziona i piedi a larghezza spalle",
            "Sblocca i fermi di sicurezza",
            "Piega le ginocchia controllando il movimento",
            "Spingi attraverso i talloni per risalire"
        ],
        tips: ["Non bloccare mai completamente le ginocchia", "Mantieni la parte bassa della schiena aderente"]
    },
    {
        name: "Bulgarian Split Squat",
        level: "intermediate",
        category: "legs",
        description: "Squat monopodalico per equilibrio e forza",
        equipment: ["panca", "manubri (opzionali)"],
        primaryMuscles: ["quadricipiti", "glutei"],
        secondaryMuscles: ["femorali", "core", "stabilizzatori"],
        instructions: [
            "Posiziona un piede su una panca dietro di te",
            "L'altro piede avanti a circa 60cm dalla panca",
            "Scendi piegando il ginocchio anteriore",
            "Risali spingendo con la gamba anteriore"
        ],
        tips: ["Mantieni il busto eretto", "Controlla l'allineamento del ginocchio"]
    },
    {
        name: "Romanian Deadlift",
        level: "intermediate",
        category: "legs",
        description: "Stacco a gambe tese per femorali e glutei",
        equipment: ["bilanciere"],
        primaryMuscles: ["femorali", "glutei"],
        secondaryMuscles: ["lombari", "core"],
        instructions: [
            "Parti in piedi con il bilanciere contro le cosce",
            "Piega leggermente le ginocchia",
            "Porta i fianchi indietro abbassando il bilanciere",
            "Risali contraendo glutei e femorali"
        ],
        tips: ["Mantieni la schiena dritta", "Il bilanciere deve sfiorare le gambe"]
    },
    {
        name: "Hack Squat",
        level: "intermediate",
        category: "legs",
        description: "Variante dello squat su macchina guidata",
        equipment: ["hack squat machine"],
        primaryMuscles: ["quadricipiti"],
        secondaryMuscles: ["glutei", "femorali"],
        instructions: [
            "Posizionati sulla macchina con i piedi a metà pedana",
            "Sblocca i fermi di sicurezza",
            "Scendi fino a quando le cosce sono parallele al suolo",
            "Risali spingendo attraverso i talloni"
        ],
        tips: ["Non far rimbalzare in fondo", "Mantieni la pressione sui talloni"]
    },
    {
        name: "Walking Lunges",
        level: "intermediate",
        category: "legs",
        description: "Affondi in movimento per gambe e equilibrio",
        equipment: ["manubri (opzionali)"],
        primaryMuscles: ["quadricipiti", "glutei"],
        secondaryMuscles: ["femorali", "core", "stabilizzatori"],
        instructions: [
            "Parti in piedi con o senza manubri",
            "Fai un passo avanti piegando entrambe le ginocchia",
            "Il ginocchio posteriore sfiora il pavimento",
            "Spingi con la gamba avanti per alzarti e avanza"
        ],
        tips: ["Mantieni il busto eretto", "Passi né troppo lunghi né troppo corti"]
    },
    {
        name: "Sissy Squat",
        level: "advanced",
        category: "legs",
        description: "Esercizio avanzato per isolamento dei quadricipiti",
        equipment: ["supporto (opzionale)"],
        primaryMuscles: ["quadricipiti"],
        secondaryMuscles: ["stabilizzatori del ginocchio"],
        instructions: [
            "In piedi con i talloni rialzati",
            "Piega le ginocchia inclinando il corpo indietro",
            "Scendi mantenendo le anche avanti",
            "Risali contraendo i quadricipiti"
        ],
        tips: ["Inizia con supporto se principiante", "Non esagerare con il range di movimento all'inizio"]
    },

    // SPALLE (SHOULDERS)
    {
        name: "Military Press",
        level: "intermediate",
        category: "shoulders",
        description: "Esercizio base per lo sviluppo delle spalle",
        equipment: ["bilanciere"],
        primaryMuscles: ["deltoidi"],
        secondaryMuscles: ["trapezio", "tricipiti"],
        instructions: [
            "Impugna il bilanciere con presa leggermente più larga delle spalle",
            "Partenza dal petto",
            "Spingi il bilanciere sopra la testa",
            "Controlla la fase di discesa"
        ],
        tips: ["Non inarcare la schiena", "Respira in modo controllato"]
    },
    {
        name: "Arnold Press",
        level: "intermediate",
        category: "shoulders",
        description: "Press con rotazione per sviluppo completo delle spalle",
        equipment: ["manubri"],
        primaryMuscles: ["deltoidi"],
        secondaryMuscles: ["trapezio", "tricipiti"],
        instructions: [
            "Parti con i manubri davanti alle spalle, palmi verso di te",
            "Mentre spingi in alto, ruota i palmi in avanti",
            "Completa il movimento sopra la testa",
            "Torna giù invertendo il movimento"
        ],
        tips: ["Mantieni il core stabile", "Non inarcare la schiena"]
    },
    {
        name: "Alzate Laterali",
        level: "beginner",
        category: "shoulders",
        description: "Isolamento per i deltoid laterali",
        equipment: ["manubri"],
        primaryMuscles: ["deltoidi laterali"],
        secondaryMuscles: ["trapezio"],
        instructions: [
            "In piedi con manubri ai lati",
            "Solleva lateralmente fino all'altezza delle spalle",
            "Mantieni una leggera flessione dei gomiti",
            "Abbassa controllando il movimento"
        ],
        tips: ["Non usare slancio", "Mantieni i polsi allineati"]
    },
    {
        name: "Face Pull",
        level: "beginner",
        category: "shoulders",
        description: "Esercizio per deltoidi posteriori e rotatori della spalla",
        equipment: ["cavo alto", "corda"],
        primaryMuscles: ["deltoidi posteriori", "trapezio"],
        secondaryMuscles: ["rotatori della spalla", "romboidi"],
        instructions: [
            "Impugna la corda al cavo alto",
            "Tira verso il viso separando le estremità della corda",
            "Porta i gomiti oltre la linea delle spalle",
            "Ritorna controllando il movimento"
        ],
        tips: ["Mantieni i gomiti alti", "Concentrati sulla contrazione posteriore"]
    },
    {
        name: "Alzate Frontali",
        level: "beginner",
        category: "shoulders",
        description: "Isolamento per i deltoidi anteriori",
        equipment: ["manubri"],
        primaryMuscles: ["deltoidi anteriori"],
        secondaryMuscles: ["trapezio superiore"],
        instructions: [
            "In piedi con manubri avanti alle cosce",
            "Solleva frontalmente fino all'altezza delle spalle",
            "Mantieni una leggera flessione dei gomiti",
            "Abbassa controllando il movimento"
        ],
        tips: ["Non usare slancio", "Alterna le braccia per variare"]
    },

    // BRACCIA (ARMS)
    {
        name: "Curl con Bilanciere",
        level: "beginner",
        category: "arms",
        description: "Esercizio base per bicipiti",
        equipment: ["bilanciere"],
        primaryMuscles: ["bicipiti"],
        secondaryMuscles: ["avambracci"],
        instructions: [
            "In piedi con il bilanciere in presa supina",
            "Mantieni i gomiti vicini ai fianchi",
            "Solleva il bilanciere con i bicipiti",
            "Controlla la fase di discesa"
        ],
        tips: ["Non usare slancio", "Mantieni i gomiti fermi"]
    },
    {
        name: "French Press",
        level: "intermediate",
        category: "arms",
        description: "Esercizio isolato per tricipiti",
        equipment: ["manubrio"],
        primaryMuscles: ["tricipiti"],
        secondaryMuscles: [],
        instructions: [
            "Sdraiati sulla panca con un manubrio tenuto a braccia tese",
            "Piega i gomiti portando il peso dietro la testa",
            "Estendi le braccia mantenendo i gomiti fermi",
            "Controlla la discesa"
        ],
        tips: ["Mantieni i gomiti stretti", "Non muovere la parte superiore del braccio"]
    },
    {
        name: "Hammer Curl",
        level: "beginner",
        category: "arms",
        description: "Curl con presa neutra per bicipiti e avambracci",
        equipment: ["manubri"],
        primaryMuscles: ["bicipiti", "brachiale"],
        secondaryMuscles: ["avambracci"],
        instructions: [
            "In piedi con manubri ai lati, presa neutra",
            "Solleva alternando le braccia",
            "Mantieni i gomiti vicini ai fianchi",
            "Controlla la fase negativa"
        ],
        tips: ["Non usare il movimento del corpo", "Mantieni i polsi dritti"]
    },
    {
        name: "Spider Curl",
        level: "intermediate",
        category: "arms",
        description: "Curl isolato per picco del bicipite",
        equipment: ["bilanciere EZ", "panca inclinata"],
        primaryMuscles: ["bicipiti"],
        secondaryMuscles: ["avambracci"],
        instructions: [
            "Stenditi a pancia in giù sulla panca inclinata",
            "Lascia penzolare le braccia",
            "Esegui il curl mantenendo i gomiti fermi",
            "Stringi al massimo in alto"
        ],
        tips: ["Non oscillare con il corpo", "Concentrati sulla contrazione di picco"]
    },
    {
        name: "Skull Crusher",
        level: "intermediate",
        category: "arms",
        description: "Esercizio base per la massa dei tricipiti",
        equipment: ["bilanciere EZ"],
        primaryMuscles: ["tricipiti"],
        secondaryMuscles: [],
        instructions: [
            "Sdraiati sulla panca con il bilanciere a braccia tese",
            "Abbassa il bilanciere verso la fronte piegando i gomiti",
            "Mantieni i gomiti fermi e paralleli",
            "Estendi le braccia tornando alla posizione iniziale"
        ],
        tips: ["Non allargare i gomiti", "Usa un peso gestibile per evitare incidenti"]
    },

    // ADDOMINALI (CORE)
    {
        name: "Crunch",
        level: "beginner",
        category: "core",
        description: "Esercizio base per addominali",
        equipment: ["tappetino"],
        primaryMuscles: ["retto addominale"],
        secondaryMuscles: ["obliqui"],
        instructions: [
            "Sdraiati supino con ginocchia piegate",
            "Mani dietro la testa",
            "Solleva le scapole da terra",
            "Torna alla posizione di partenza controllando il movimento"
        ],
        tips: ["Non tirare il collo con le mani", "Espira durante la contrazione"]
    },
    {
        name: "Plank",
        level: "beginner",
        category: "core",
        description: "Esercizio isometrico per la stabilità del core",
        equipment: ["tappetino"],
        primaryMuscles: ["retto addominale", "traverso"],
        secondaryMuscles: ["obliqui", "lombari"],
        instructions: [
            "Posizionati sugli avambracci e sulla punta dei piedi",
            "Mantieni il corpo allineato dalla testa ai talloni",
            "Contrai gli addominali",
            "Mantieni la posizione"
        ],
        tips: ["Non abbassare i fianchi", "Respira normalmente"]
    },
    {
        name: "Russian Twist",
        level: "intermediate",
        category: "core",
        description: "Rotazioni del busto per obliqui",
        equipment: ["peso (opzionale)"],
        primaryMuscles: ["obliqui"],
        secondaryMuscles: ["retto addominale", "flessori dell'anca"],
        instructions: [
            "Siediti con ginocchia piegate e piedi sollevati",
            "Inclina il busto indietro mantenendo la schiena dritta",
            "Ruota il busto da un lato all'altro",
            "Mantieni la posizione delle gambe"
        ],
        tips: ["Mantieni il petto alto", "Respirazione regolare"]
    },
    {
        name: "Dragon Flag",
        level: "advanced",
        category: "core",
        description: "Esercizio avanzato per tutto il core",
        equipment: ["panca"],
        primaryMuscles: ["retto addominale", "obliqui"],
        secondaryMuscles: ["lombari", "flessori dell'anca"],
        instructions: [
            "Sdraiati sulla panca afferrando il bordo dietro la testa",
            "Solleva il corpo mantenendolo rigido",
            "Abbassa lentamente mantenendo le gambe dritte",
            "Non toccare la panca con la parte bassa del corpo"
        ],
        tips: ["Inizia con le ginocchia piegate", "Progredisci gradualmente"]
    },
    {
        name: "Rollout con Ruota",
        level: "intermediate",
        category: "core",
        description: "Esercizio dinamico per addominali e stabilità",
        equipment: ["ruota addominali"],
        primaryMuscles: ["retto addominale", "traverso"],
        secondaryMuscles: ["dorsali", "pettorali"],
        instructions: [
            "In ginocchio con la ruota davanti",
            "Rotola in avanti mantenendo la schiena dritta",
            "Estendi il più possibile senza perdere la posizione",
            "Ritorna alla posizione iniziale usando gli addominali"
        ],
        tips: ["Mantieni sempre il core contratto", "Non inarcare la schiena"]
    },

    // CARDIO
    {
        name: "Burpees",
        level: "intermediate",
        category: "cardio",
        description: "Esercizio full body ad alta intensità",
        equipment: [],
        primaryMuscles: ["full body"],
        secondaryMuscles: ["full body"],
        instructions: [
            "Parti in piedi",
            "Scendi in posizione di push up",
            "Esegui una flessione",
            "Porta i piedi vicino alle mani con un salto",
            "Salta verso l'alto con le braccia tese"
        ],
        tips: ["Mantieni un ritmo costante", "Modifica in base al tuo livello"]
    },
    {
        name: "Mountain Climbers",
        level: "intermediate",
        category: "cardio",
        description: "Esercizio cardio che coinvolge tutto il corpo",
        equipment: [],
        primaryMuscles: ["core", "flessori dell'anca"],
        secondaryMuscles: ["spalle", "pettorali"],
        instructions: [
            "Parti in posizione di plank",
            "Porta alternamente le ginocchia al petto",
            "Mantieni il corpo allineato",
            "Aumenta gradualmente la velocità"
        ],
        tips: ["Non alzare i fianchi", "Mantieni un ritmo costante"]
    },
    {
        name: "Box Jump",
        level: "intermediate",
        category: "cardio",
        description: "Salti pliometrici per potenza e cardio",
        equipment: ["plyo box"],
        primaryMuscles: ["quadricipiti", "glutei"],
        secondaryMuscles: ["polpacci", "core"],
        instructions: [
            "Posizionati di fronte al box",
            "Piega leggermente le ginocchia",
            "Salta sul box atterrando con le ginocchia ammortizzate",
            "Scendi controllando il movimento o salta giù all'indietro"
        ],
        tips: ["Inizia con box bassi", "Atterra morbido con tutto il piede"]
    },
    {
        name: "Battle Rope",
        level: "advanced",
        category: "cardio",
        description: "Esercizio ad alta intensità per resistenza e forza",
        equipment: ["battle ropes"],
        primaryMuscles: ["spalle", "braccia"],
        secondaryMuscles: ["core", "dorsali"],
        instructions: [
            "Impugna le estremità delle corde",
            "Esegui onde alternate con le braccia",
            "Mantieni un ritmo costante",
            "Varia l'ampiezza e la velocità dei movimenti"
        ],
        tips: ["Mantieni le ginocchia leggermente piegate", "Respira regolarmente"]
    }
];

async function seedExercises() {
    try {
        // Connessione senza concatenare /fitness_app nell'URI
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'fitness_app'  // Specifica il database qui
        });

        console.log('Connected successfully to MongoDB Atlas');
        console.log('Current database:', mongoose.connection.db.databaseName);

        console.log('Deleting existing exercises...');
        await Exercise.deleteMany({});
        console.log('Existing exercises deleted');

        console.log('Inserting exercises...');
        const result = await Exercise.insertMany(sampleExercises);
        console.log(`Successfully inserted ${result.length} exercises`);

        // Verifica
        const count = await Exercise.countDocuments();
        console.log(`Total exercises in database: ${count}`);

    } catch (error) {
        console.error('Error during seeding:', error);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log('Database connection closed');
        }
        process.exit(0);
    }
}

// Esegui la funzione
seedExercises();


//node scripts/seed.js