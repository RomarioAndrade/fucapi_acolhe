const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'fucapi_acolhe'
};


const createConnection = async () => {
    return await mysql.createConnection(dbConfig);
};

const initializeDatabase = async () => {
    try {
        const connection = await createConnection();

        await connection.execute(`
          CREATE TABLE IF NOT EXISTS user_role (
            id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
            descricao VARCHAR(255) NOT NULL,
            papel VARCHAR(255) NOT NULL,
            ativo BOOLEAN DEFAULT TRUE,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Create users table
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            id_role INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_role) REFERENCES user_role(id)
          )
        `);

        //Create categorias_tarefas table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS categorias_tarefas (
                id INT PRIMARY KEY AUTO_INCREMENT,
                id_usuario INT NOT NULL,
                nome VARCHAR(50) NOT NULL,
                descricao TEXT,
                cor VARCHAR(7) DEFAULT '#3498db',
                ativo BOOLEAN DEFAULT TRUE,
                FOREIGN KEY (id_usuario) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Create tarefas  table
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS tarefas  (
            id INT AUTO_INCREMENT PRIMARY KEY,
            id_usuario INT NOT NULL,
            id_categoria  INT NOT NULL,
            titulo VARCHAR(200) NOT NULL,
            descricao TEXT,
            status ENUM('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA', 'ADIADA') DEFAULT 'PENDENTE',
            data_inicio DATETIME,
            data_termino DATETIME,
            FOREIGN KEY (id_usuario) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (id_categoria) REFERENCES categorias_tarefas(id)
          )
        `);

        // Create conversations table
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS conversations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user1_id INT NOT NULL,
            user2_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user1_id) REFERENCES users(id),
            FOREIGN KEY (user2_id) REFERENCES users(id),
            UNIQUE KEY unique_conversation (user1_id, user2_id)
          )
        `);

        // Create messages table
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            conversation_id INT NOT NULL,
            sender_id INT NOT NULL,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id),
            FOREIGN KEY (sender_id) REFERENCES users(id)
          )
        `);

        // Adicione após a criação da tabela messages
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS files (
            id INT AUTO_INCREMENT PRIMARY KEY,
            message_id INT,
            conversation_id INT NOT NULL,
            sender_id INT NOT NULL,
            original_name VARCHAR(255) NOT NULL,
            stored_name VARCHAR(255) NOT NULL,
            file_path VARCHAR(500) NOT NULL,
            file_size BIGINT NOT NULL,
            mime_type VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id),
            FOREIGN KEY (sender_id) REFERENCES users(id)
          )
        `);

        // Tabela de Questionários
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS questionarios (
                id INT PRIMARY KEY AUTO_INCREMENT,
                usuario_id INT NOT NULL,
                data_preenchimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ativo BOOLEAN DEFAULT TRUE,
                FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_usuario_data (usuario_id, data_preenchimento)
            )
        `);

        // Tabela de Perguntas
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS perguntas (
                id INT PRIMARY KEY AUTO_INCREMENT,
                texto TEXT NOT NULL,
                tipo_resposta ENUM('textual', 'multipla_escolha') NOT NULL,
                ordem_exibicao INT,
                ativa BOOLEAN DEFAULT TRUE
            )
        `);

        // Tabela de Respostas Padrão
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS respostas_padrao (
                                                            id INT PRIMARY KEY AUTO_INCREMENT,
                                                            pergunta_id INT NOT NULL,
                                                            valor INT NOT NULL,
                                                            texto VARCHAR(200) NOT NULL,
                FOREIGN KEY (pergunta_id) REFERENCES perguntas(id) ON DELETE CASCADE,
                UNIQUE KEY unique_pergunta_valor (pergunta_id, valor)
                )
        `);

        // Tabela de Respostas do Usuário
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS respostas_usuario (
                id INT PRIMARY KEY AUTO_INCREMENT,
                questionario_id INT NOT NULL,
                id_usuario INT,
                pergunta_id INT NOT NULL,
                resposta_id INT,
                resposta_textual TEXT,
                FOREIGN KEY (questionario_id) REFERENCES questionarios(id) ON DELETE CASCADE,
                FOREIGN KEY (pergunta_id) REFERENCES perguntas(id),
                FOREIGN KEY (resposta_id) REFERENCES respostas_padrao(id),
                CHECK (resposta_id IS NOT NULL OR resposta_textual IS NOT NULL)
            )
        `);

        //Tabela Perfil de Necessidades
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS perfil_necessidades (
                id INT PRIMARY KEY AUTO_INCREMENT,
                necessidades TEXT NOT NULL,
                id_usuario INT NOT NULL,
                FOREIGN KEY (id_usuario) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        //Tabela de Possibilidades
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS acao (
                id INT PRIMARY KEY AUTO_INCREMENT,
                texto TEXT NOT NULL
            );
        `);

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS estimulos(
                id INT PRIMARY KEY auto_increment,
                influenciado ENUM('Provas/Trabalhos', 'Interação Social','Barulho/Ambiente','Mudança na Rotina','Cansaço')
            );
        `);

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS infuenciado(
                id INT PRIMARY KEY AUTO_INCREMENT,
                estimulo_id INT NOT NULL ,
                data DATETIME,
                FOREIGN KEY (estimulo_id) REFERENCES estimulos(id)
                );
        `);

        //Tabela Diario de Emoções
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS diario_emocoes(
                id INT PRIMARY KEY AUTO_INCREMENT,
                emocao_inicial INT NOT NULL ,
                emocao_final INT NOT NULL ,
                influenciado INT NOT NULL ,
                primeira_acao INT,
                segunda_acao INT,
                terceira_acao INT,
                diario TEXT,
                FOREIGN KEY (emocao_inicial) REFERENCES infuenciado(id),
                FOREIGN KEY (emocao_final) REFERENCES infuenciado(id),
                FOREIGN KEY (primeira_acao) REFERENCES acao(id),
                FOREIGN KEY (segunda_acao) REFERENCES acao(id),
                FOREIGN KEY (terceira_acao) REFERENCES acao(id)                
            );
        `);

        //Tabela Cardio
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS cardio (
                id INT PRIMARY KEY AUTO_INCREMENT,
                usuario_id INT NOT NULL,
                bpm INT NOT NULL,
                data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
        );`);

        console.log('Database initialized successfully');
        await connection.end();
    } catch (error) {
        console.error('Database initialization failed:', error);
    }
};

module.exports = {createConnection,initializeDatabase};