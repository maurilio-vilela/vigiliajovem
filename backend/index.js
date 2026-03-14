// CARREGAMENTO ROBUSTO DO .ENV NO TOPO
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log('Configuração do DB:', {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

console.log('Configuração do Admin:', {
  admin_user: process.env.ADMIN_USER,
  admin_pass: process.env.ADMIN_PASS,
});

console.log('Configuração do Email:', {
  email_user: process.env.EMAIL_USER,
  email_pass: process.env.EMAIL_PASS,
});

const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const UAParser = require('ua-parser-js');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'https://vigiliajovem.vilelatech.com.br' }));

// Configuração do transporter para Zoho Mail
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  requireTLS: true,
  connectionTimeout: 10000,
  greetingTimeout: 5000,
  socketTimeout: 10000,
  logger: true,
  debug: true,
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Erro ao verificar conexão com Zoho Mail:', error);
  } else {
    console.log('Conexão com Zoho Mail verificada com sucesso');
  }
});

app.use('/', express.static(path.join(__dirname, '../frontend/out')));

app.post('/api/inscricao', async (req, res) => {
  console.log('Dados recebidos:', req.body);

  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const parser = new UAParser();
  const userAgent = req.headers['user-agent'] || '';
  const uaResult = parser.setUA(userAgent).getResult();
  const navegador = uaResult.browser.name ? `${uaResult.browser.name} ${uaResult.browser.version}` : 'Desconhecido';
  const dispositivo = uaResult.device.model || uaResult.os.name ? `${uaResult.device.model || ''} (${uaResult.os.name} ${uaResult.os.version})` : 'Desconhecido';
  const url_inscricao = req.headers['referer'] || req.body.url_inscricao || 'Desconhecido';

  const {
    nome_completo,
    data_nascimento,
    email,
    telefone,
    endereco,
    cidade,
    paroquia_comunidade,
    movimento_pastoral,
    qual_movimento,
    grupo_oracao_rcc,
    qual_grupo_oracao,
    participou_retiro,
    autoriza_dados,
    autoriza_imagem,
  } = req.body;

  console.log('Valores extraídos:', {
    nome_completo,
    data_nascimento,
    email,
    telefone,
    endereco,
    cidade,
    paroquia_comunidade,
    movimento_pastoral,
    qual_movimento,
    grupo_oracao_rcc,
    qual_grupo_oracao,
    participou_retiro,
    autoriza_dados,
    autoriza_imagem,
    ip,
    dispositivo,
    navegador,
    url_inscricao,
  });

  if (!nome_completo || !data_nascimento || !telefone || !endereco || !cidade || !paroquia_comunidade || !autoriza_dados) {
    console.log('Erro: Campos obrigatórios não preenchidos');
    return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
  }

  if (movimento_pastoral === 'sim' && !qual_movimento) {
    console.log('Erro: Movimento pastoral não informado');
    return res.status(400).json({ error: 'Por favor, informe o movimento pastoral' });
  }
  if (grupo_oracao_rcc === 'sim' && !qual_grupo_oracao) {
    console.log('Erro: Grupo de oração RCC não informado');
    return res.status(400).json({ error: 'Por favor, informe o grupo de oração RCC' });
  }

  const convertToBoolean = (value) => {
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase().trim();
      return lowerValue === 'true' || lowerValue === 'sim' || lowerValue === '1' || lowerValue === 'yes';
    }
    return !!value;
  };

  const autoriza_dados_bool = convertToBoolean(autoriza_dados);
  const autoriza_imagem_bool = convertToBoolean(autoriza_imagem);
  const movimento_pastoral_bool = convertToBoolean(movimento_pastoral);
  const grupo_oracao_rcc_bool = convertToBoolean(grupo_oracao_rcc);
  const participou_retiro_bool = convertToBoolean(participou_retiro);

  try {
    await pool.connect();
    const result = await pool.query(
      'INSERT INTO inscricoes (nome_completo, data_nascimento, email, telefone, endereco, cidade, paroquia_comunidade, movimento_pastoral, qual_movimento, grupo_oracao_rcc, qual_grupo_oracao, participou_retiro, autoriza_dados, autoriza_imagem, ip, dispositivo, navegador, url_inscricao) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *',
      [
        nome_completo,
        data_nascimento,
        email || null,
        telefone,
        endereco,
        cidade,
        paroquia_comunidade,
        movimento_pastoral_bool,
        qual_movimento || null,
        grupo_oracao_rcc_bool,
        qual_grupo_oracao || null,
        participou_retiro_bool,
        autoriza_dados_bool,
        autoriza_imagem_bool,
        ip,
        dispositivo,
        navegador,
        url_inscricao,
      ]
    );

    const inscrito = result.rows[0];
    
    // CORREÇÃO ANTI-CRASH: Envia a resposta de sucesso APENAS
    res.json({ success: true, redirect: '/sucesso' });

    // --- Início dos envios de e-mail (em segundo plano) ---
    // Colocamos os envios de e-mail em uma função separada "fire and forget"
    // para que um erro do Zoho (como "Unusual activity") NÃO "crashe" o servidor.
    const sendEmails = async () => {
      try {
        if (email) {
          await transporter.sendMail({
            from: 'Grupo de Oração Luz no meu Caminho <gojes@vilelatech.com.br>', // Corrigido
            to: email,
            subject: 'Confirmação de Inscrição - II Vigília Jovem',
            html: `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Confirmação de Inscrição - II Vigília Jovem</title></head><body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #E0E8F0; color: #333;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #E0E8F0;"><tr><td align="center"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); margin: 20px 0;"><tr><td style="padding: 20px; background-color: #E0E8F0; background-image: url('https://vigiliajovem.vilelatech.com.br/images/background-email.png'); border-top-left-radius: 10px; border-top-right-radius: 10px; text-align: center;"><img src="https://vigiliajovem.vilelatech.com.br/images/logo.png" alt="Logotipo Vigília Jovem" style="max-width: 150px; height: auto;" /></td></tr><tr><td style="padding: 30px; text-align: center;"><h1 style="font-size: 28px; color: #B91C1C; margin: 0 0 15px; font-weight: bold;">Sua Inscrição está Confirmada, ${nome_completo}!</h1><h2 style="font-size: 22px; color: #333; margin: 0 0 15px; font-weight: bold;">II Vigília Jovem: O Encontro das Duas Sedes</h2><p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">A <strong>II Vigília Jovem</strong> está chegando, e será uma noite inesquecível onde duas sedes se encontram: a sede que Deus tem de nós, e a nossa sede de Deus. ❤️‍🔥</p><p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Como disse Santo Agostinho, <i>"O meu coração anda inquieto, enquanto não descansar em ti."</i> Vamos mergulhar em uma noite de oração, louvor e adoração para encontrar esse descanso. 🙏</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F4F7F9; border-radius: 8px; padding: 20px; margin: 20px 0;"><tr><td style="text-align: center;"><h2 style="font-size: 20px; color: #B91C1C; margin: 0 0 10px;">Informações Importantes</h2><p style="font-size: 16px; margin: 0 0 10px;"><strong>🗓️ Data:</strong> 06 de dezembro</p><p style="font-size: 16px; margin: 0 0 10px;"><strong>🕘 Início:</strong> 22:00</p><p style="font-size: 16px; margin: 0 0 10px;"><strong>🏛 Local:</strong> Paróquia Nossa Senhora de Fátima - Vila Luizão</p><p style="font-size: 16px; margin: 0 0 10px;"><strong>⏰ Duração:</strong> Das 22:00 até às 06:00</p><p style="font-size: 16px; margin: 0; color: #B91C1C;"><strong>💸 Entrada Gratuita!</strong></p></td></tr></table><p style="font-size: 16px; margin: 0 0 20px;">Conecte-se com outros jovens e receba atualizações! Entre no nosso grupo do WhatsApp:</p><a href="https://chat.whatsapp.com/JBwW5Bj6h7oEU6FvDBLbGK" style="display: inline-block; background-color: #25D366; color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 25px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); line-height: 1;"><svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24" style="vertical-align: middle;"><path d="M12 0C5.373 0 0 5.373 0 12c0 2.134.56 4.245 1.62 6.077L0 24l5.977-1.62A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22.022c-1.96 0-3.843-.56-5.48-1.604l-.393-.234-3.543.957.957-3.543-.234-.393A9.978 9.978 0 012 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.62-6.194c-.308-.154-1.833-.904-2.118-1.008-.286-.104-.494-.154-.702.154-.208.308-.808 1.008-.988 1.216-.18.208-.36.232-.668.078-.308-.154-1.298-.478-2.474-1.528-.914-.814-1.528-1.814-1.708-2.122-.18-.308-.02-.474.134-.628.138-.138.308-.36.462-.54.154-.18.208-.308.308-.514.1-.206.05-.386-.024-.54-.074-.154-.668-1.604-.914-2.194-.24-.576-.486-.496-.668-.504-.18-.008-.386-.008-.594-.008a1.14 1.14 0 00-.834.386c-.286.308-.988.964-1.008 2.346 0 1.382.988 2.716 1.126 2.922.138.206 1.95 3.15 4.732 4.17 1.754.64 2.47.408 2.96.258.494-.15.914-.594 1.008-1.142.094-.548.054-.996-.218-1.37z"/></svg><span style="vertical-align: middle;">Entrar no Grupo do WhatsApp</span></a></td></tr><tr><td style="padding: 20px; background-color: #E0E8F0; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; text-align: center;"><p style="font-size: 14px; color: #666; margin: 0 0 10px;">Te esperamos para viver essa experiência única de fé e encontro. ❤️</p><p style="font-size: 14px; color: #666; margin: 0;">Em caso de dúvidas, entre em contato pelo WhatsApp.</p></td></tr></table></td></tr></table></body></html>`,
          });
        }
    
        await transporter.sendMail({
          from: 'Grupo de Oração Jesus é o Senhor <gojes@vilelatech.com.br>',
          to: 'gojes@vilelatech.com.br',
          subject: `Nova Inscrição Vigília Jovem - ${nome_completo}`,
          html: `<p>Nova inscrição recebida:</p><ul><li>Nome: ${nome_completo}</li><li>Data de Nascimento: ${data_nascimento}</li><li>E-mail: ${email || 'Não informado'}</li><li>Telefone: ${telefone}</li><li>Endereço: ${endereco}</li><li>Cidade: ${cidade}</li><li>Paróquia/Comunidade: ${paroquia_comunidade}</li><li>Movimento/Pastoral: ${movimento_pastoral_bool ? 'Sim' : 'Não'}</li><li>Qual Movimento: ${qual_movimento || 'N/A'}</li><li>Grupo de Oração RCC: ${grupo_oracao_rcc_bool ? 'Sim' : 'Não'}</li><li>Qual Grupo: ${qual_grupo_oracao || 'N/A'}</li><li>Participou de Retiro: ${participou_retiro_bool ? 'Sim' : 'Não'}</li><li>Autoriza Dados: ${autoriza_dados_bool}</li><li>Autoriza Imagem: ${autoriza_imagem_bool}</li><li>IP: ${ip}</li><li>Dispositivo: ${dispositivo}</li><li>Navegador: ${navegador}</li><li>URL de Inscrição: ${url_inscricao}</li></ul><p>Data/Hora: ${new Date().toISOString()}</p>`,
        });

      } catch (emailError) {
        // Se o envio de e-mail falhar, apenas logamos o erro no console.
        // NÃO tentamos enviar uma resposta ao cliente (res.status)
        // porque ele já recebeu a resposta de sucesso.
        console.error('Erro ao enviar e-mail (em segundo plano):', emailError);
      }
    };
    
    // Inicia o envio de e-mails em segundo plano
    sendEmails();

  } catch (error) {
    console.error('Erro ao processar inscrição (falha no DB):', error);
    // CORREÇÃO ANTI-CRASH:
    // Só enviamos uma resposta de erro se nenhuma resposta de sucesso foi enviada.
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro ao processar inscrição', details: error.message });
    }
  }
});

app.post('/api/login', (req, res) => {
  console.log('Credenciais recebidas:', req.body);
  console.log('Credenciais esperadas:', {
    admin_user: process.env.ADMIN_USER,
    admin_pass: process.env.ADMIN_PASS,
  });
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    const token = jwt.sign({ user: username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

app.get('/api/inscricoes', async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token ausente' });

  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    console.log('Tentando buscar inscrições...');
    const result = await pool.query('SELECT * FROM inscricoes ORDER BY nome_completo');
    console.log('Inscrições buscadas com sucesso:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar inscrições:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Endpoint DELETE para excluir inscrição
app.delete('/api/inscricoes/:id', async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token ausente' });

  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    const { id } = req.params;
    const result = await pool.query('DELETE FROM inscricoes WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      console.log('Inscrição não encontrada:', id);
      return res.status(404).json({ error: 'Inscrição não encontrada' });
    }

    console.log('Inscrição excluída com sucesso:', result.rows[0]);
    res.json({ message: 'Inscrição excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir inscrição:', error);
    res.status(500).json({ error: 'Erro ao excluir inscrição', details: error.message });
  }
});

// Endpoint PUT para editar inscrição
app.put('/api/inscricoes/:id', async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token ausente' });

  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    const { id } = req.params;
    const {
      nome_completo,
      data_nascimento,
      email,
      telefone,
      endereco,
      cidade,
      paroquia_comunidade,
      movimento_pastoral,
      qual_movimento,
      grupo_oracao_rcc,
      qual_grupo_oracao,
      participou_retiro,
    } = req.body;

    const result = await pool.query(
      'UPDATE inscricoes SET nome_completo = $1, data_nascimento = $2, email = $3, telefone = $4, endereco = $5, cidade = $6, paroquia_comunidade = $7, movimento_pastoral = $8, qual_movimento = $9, grupo_oracao_rcc = $10, qual_grupo_oracao = $11, participou_retiro = $12 WHERE id = $13 RETURNING *',
      [
        nome_completo,
        data_nascimento,
        email || null,
        telefone,
        endereco,
        cidade,
        paroquia_comunidade,
        movimento_pastoral,
        qual_movimento || null,
        grupo_oracao_rcc,
        qual_grupo_oracao || null,
        participou_retiro,
        id,
      ]
    );

    if (result.rowCount === 0) {
      console.log('Inscrição não encontrada:', id);
      return res.status(404).json({ error: 'Inscrição não encontrada' });
    }

    console.log('Inscrição atualizada com sucesso:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar inscrição:', error);
    res.status(500).json({ error: 'Erro ao atualizar inscrição', details: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));