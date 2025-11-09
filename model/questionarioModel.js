const {createConnection} = require('../database/db');

class QuestionarioModel {
    // Salvar questionário completo
    async salvarQuestionario(dados) {
        const connection = await createConnection();

        try {
            await connection.beginTransaction();

            // Inserir questionário
            /*const [questionarioResult] = await connection.execute(
                'INSERT INTO questionarios (usuario_id) VALUES (?)',
                [usuarioId]
            );

            const questionarioId = questionarioResult.insertId;*/

            // Inserir respostas
            for (const perguntaId in dados.respostas) {
                if (dados.respostas.hasOwnProperty(perguntaId)) {
                    const respostaId = dados.respostas[perguntaId];

                    await connection.execute(
                        'INSERT INTO respostas_usuario (questionario_id, pergunta_id, resposta_id,resposta_textual) VALUES (?, ?, ?,?)',
                        [questionarioId, perguntaId, respostaId]
                    );
                }
            }

            await connection.commit();
            return {success: true, questionarioId, pontuacaoTotal};

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            await connection.end();
        }
    }

    // Obter todas as perguntas
    async obterPerguntas() {
        const connection = await createConnection();
        try {
            const [perguntas] = await connection.execute(`
                SELECT p.id, p.texto, p.ordem_exibicao, p.tipo_resposta
                FROM perguntas p
                WHERE p.ativa = TRUE
                ORDER BY p.ordem_exibicao
            `);
            return perguntas;
        } catch (error) {
            throw error;
        } finally {
            await connection.end();
        }
    }

    async obterRespostas_padrao(id) {
        const connection = await createConnection();
        try {

            const [respostas] = await connection.execute(`
                SELECT id, valor, texto
                FROM respostas_padrao
                WHERE pergunta_id = ?
                ORDER BY valor
            `,[id]);
            return respostas;
        } catch (error) {
            throw error;
        } finally {
            await connection.end();
        }
    }
}

module.exports = new QuestionarioModel();