const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const exerciseRoutes = require('./routes/exercise');
const usersRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');
const schedeRoutes = require('./routes/schede');

// Carica le variabili d'ambiente
dotenv.config();

// Inizializzazione express e server HTTP
const app = express();
const server = http.createServer(app);

// Configurazione CORS
app.use(cors({
    origin: true,  // Accetta tutte le origini temporaneamente
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'x-xsrf-token'],
    exposedHeaders: ['x-auth-token']
}));
app.use(cors(corsOptions));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Configurazione cartella uploads
app.use('/uploads', express.static('uploads'));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/schede', schedeRoutes);

// Configurazione Socket.IO
const io = new Server(server, {
    cors: corsOptions
});

// Verifica della presenza della stringa di connessione MongoDB
if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI non è definito nelle variabili d\'ambiente');
    process.exit(1);
}

// Configurazione Mongoose
mongoose.set('strictQuery', false);

// Connessione MongoDB con retry
const connectWithRetry = async () => {
    const maxRetries = 5;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000,
                dbName: 'fitness_app'
            });
            console.log('✅ Connected successfully to MongoDB');
            break;
        } catch (err) {
            retries++;
            console.error(`❌ MongoDB connection attempt ${retries} failed:`, err);
            if (retries === maxRetries) {
                console.error('❌ Max retries reached. Exiting...');
                process.exit(1);
            }
            // Attendi 5 secondi prima di riprovare
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

connectWithRetry();


// Gestione Socket.IO
io.on('connection', (socket) => {
    console.log('Nuovo utente connesso:', socket.id);

    // Invia un messaggio di benvenuto
    socket.emit('message', {
        text: "Ciao! Sono l'assistente virtuale di Rain Fitness. Come posso aiutarti?",
        from: 'assistant',
        timestamp: new Date().toISOString()
    });

    // Gestione dei messaggi in arrivo
    socket.on('sendMessage', (message) => {
        console.log('Messaggio ricevuto:', message);

        // Logica per le risposte dell'assistente
        let response = '';
        const lowerMessage = message.toLowerCase();

        // Risposte basate su parole chiave
        if (lowerMessage.includes('orari') || lowerMessage.includes('orario')) {
            response = "Puoi contattare il numero +39 123 456 7890 dal lunedì al venerdì dalle 9:00 alle 18:00.";
        }
        else if (lowerMessage.includes('prezzo') || lowerMessage.includes('prezzi') || lowerMessage.includes('costo') || lowerMessage.includes('costi') || lowerMessage.includes('abbonamento') || lowerMessage.includes('pagare')) {
            response = "Al solo costo di 0,99€ puoi accedere a tutte le funzioni dell'applicazione.\n" +
                "Dovessi scegliere di farti seguire da uno dei nostri Trainer, potresti dover andare incontro ai costi di listino del Trainer specifico.\n" +
                "Puoi sempre scegliere di cercare le schede pubblicate in autonomia o crearle tu stesso in maniera del tutto gratuita.\n" +
                "Per maggiori informazioni scrivimi un'altra domanda oppure contattaci telefonicamente al numero +39 123 456 7890. ";
        }
        else if (lowerMessage.includes('allenamento') || lowerMessage.includes('scheda') || lowerMessage.includes('schede')) {
            response = "Puoi creare direttamente tu la scheda accedendo alla pagina dell'applicazione specifica oppure visualizzare il catalogo delle schede pubblicate e scegliere quella più adatta a te.\n" +
                "Puoi anche affidarti ad uno dei nostri personal trainer. Sono disponibili per creare un programma personalizzato in base ai tuoi obiettivi.\n" +
                "Puoi prenotare una consulenza gratuita direttamente  dall'applicazione.";
        }
        else if (lowerMessage.includes('trainer') || lowerMessage.includes('personal')) {
            response = "I nostri personal trainer sono professionisti certificati con anni di esperienza.\n" +
                "Puoi vedere i loro profili nella sezione 'Trainer' nella pagina chat dell'app e scegliere quello più adatto alle tue esigenze.\n" +
            "Scegli il piano più adatto a te dopo aver parlato con il Trainer selezionato; i costi per farsi seguire o per farsi creare schede personalizzate sono a discrezione del Trainer.";
        }
        else if (lowerMessage.includes('attrezzatura') || lowerMessage.includes('macchinari')) {
            response = "La nostra piattaforma è pensata per tutti e per ogni tipo di allenamento, che sia con  attrezzatura, a corpo libero o funzionale.";
        }
        else if (lowerMessage.includes('account') || lowerMessage.includes('profilo')) {
            response = "Per creare il tuo account devi utilizzare il bottono ISCRIZIONE e scegliere se creare un account da Atleta o Persona Trainer.\n" +
                "Una volta creato l'account, puoi modificare i tuoi dati personali direttamente dalla sezione PROFILO.\n"
        }
        else if (lowerMessage.includes('sicurezza') || lowerMessage.includes('protocolli')) {
            response = "Seguiamo rigorosi protocolli e controlli di sicurezza. Le schede pubblicate o create appositamente per te sono tutte testate e provate prima di essere inviate.";
        }
        else if (lowerMessage.includes('esercizio') || lowerMessage.includes('esercizi')) {
            response = "Disponiamo di un ampio catalogo di esercizi da poter aggiungere ad una scherda personale in maniera del tutto gratuita per i nostri clienti.";
        }
        else if (lowerMessage.includes('ciao') || lowerMessage.includes('salve') || lowerMessage.includes('buongiorno') || lowerMessage.includes('buonasera')) {
            response = "Ciao! Come posso aiutarti oggi?";
        }
        else if (lowerMessage.includes('iscrizione')) {
            response = "Una volta installata l'applicazione, devi solo creare il tuo account e iniziare a utilizzare l'app";
        }
        else if (lowerMessage.includes('funziona') || lowerMessage.includes('fa')) {
            response = "Questa piattaforma è il posto perfetto per chi vuole tenersi in forma. Mette a disposizione centinaia di schede consultabili provate oppure ti dà la possibilità di crearla direttamente.";
        }
        else if (lowerMessage.includes('grazie')) {
            response = "Grazie a te! Sono qui se hai bisogno di altro aiuto.";
        }
        else {
            response = "Mi dispiace, non ho capito completamente la tua richiesta. Puoi riformularla in modo diverso?\n" +
                "Posso aiutarti con informazioni su orari, prezzi, trainer e servizi della piattaforma.";
        }

        // Invia la risposta
        socket.emit('message', {
            text: response,
            from: 'assistant',
            timestamp: new Date().toISOString()
        });
    });

    // Gestione della disconnessione
    socket.on('disconnect', () => {
        console.log('Utente disconnesso:', socket.id);
    });

    // Gestione degli errori
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

// Gestione degli errori non catturati
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

// Avvio del server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
