const { createClient } = require('@supabase/supabase-js');
const express = require('express'); // Se você estiver usando Express

const app = express();
const port = 3000;

// Substitua pelas suas credenciais do Supabase
const supabaseUrl = 'https://seu-projeto.supabase.co';
const supabaseAnonKey = 'sua-chave-anonima';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Rota para inserir dados no Supabase
app.post('/salvar-dado', async (req, res) => {
    const { nome, email } = req.body; // Adapte para os campos do seu formulário
    const { data, error } = await supabase
        .from('sua_tabela')
        .insert([{ nome, email }])
        .select();

    if (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao inserir dados' });
    } else {
        res.json(data);
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
