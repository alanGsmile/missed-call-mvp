import express from 'express';

const app = express();

// Позволяваме на Express да чете JSON и Form Data (Zadarma праща Form Data)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Общ endpoint за Zadarma
app.all('/webhooks/zadarma', (req, res) => {
    // 1. Проверка от Zadarma (когато добавяш линка в сайта им)
    if (req.query.zd_echo) {
        console.log('✅ Zadarma verification received:', req.query.zd_echo);
        return res.send(req.query.zd_echo);
    }

    // 2. Реално събитие за обаждане (NOTIFY_START, NOTIFY_END и др.)
    console.log('-----------------------------------');
    console.log('📞 New event from Zadarma!');
    console.log('Method:', req.method);
    console.log('Body:', req.body);
    console.log('-----------------------------------');

    // Винаги връщаме 200 OK, за да знае Zadarma, че сме получили данните
    res.sendStatus(200);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});