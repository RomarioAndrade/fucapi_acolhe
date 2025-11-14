const {createConnection} = require('../database/db');

class diarioModel {
    //
    async createDiario(data, usuarioId) {
        const connection = await createConnection();
        try {
            await connection.beginTransaction();
            let acoes_id = [];

            for (const element of data.acoes) {
                const result = await this.createAcao(element);
                acoes_id.push(result);
            }

            console.log(data);

            const [result] = await connection.execute(`
                insert into diario_emocoes(usuario_id, emocao_inicial, emocao_final, primeira_acao, segunda_acao,
                                           terceira_acao, diario)
                values (?, ?, ?, ?, ?, ?,
                        ?)`, [usuarioId, data.emocao_inicial, data.emocao_final, acoes_id[0], acoes_id[1], acoes_id[2], data.diario]);

            for (const element of data.influenciado) {
                console.log(`influenciado: ${element}`);
                const estimulo_id = await this.findEstimulo(element).insertId;

                console.log("estimulo id" + estimulo_id);
                console.log(`result ${result.insertId}`);

                const resultado = await connection.execute(`
                    insert into influenciado(diario_id, estimulo_id)
                    values (?, ?)`, [result.insertId, estimulo_id]);
            }

            await connection.commit();
            return {success: true};
        } catch (error) {
            console.error('Transaction failed:', error);
            await connection.rollback();
            console.log('Transaction rolled back.');
            throw error;
        } finally {
            await connection.end();
        }
    }

    async createAcao(acao) {
        const connection = await createConnection();
        try {
            const [row] = await connection.execute(`
                insert into acao(texto)
                values (?)
            `, [acao]);
            return row;
        } catch (error) {
            throw error;
        } finally {
            await connection.end();
        }
    }

    async findEstimulo(estimulo) {
        const connection = await createConnection();
        try {
            const [row] = await connection.execute(`
                select id
                from estimulos
                where influenciado = ?;
            `, [estimulo]);
            return row;
        } catch (error) {
            throw error;
        } finally {
            await connection.end();
        }
    }

    async getDiarios(usuarioId) {
        const connection = await createConnection();
        try {
            const [row] = await connection.execute(`select *
                                                    from diario_emocoes
                                                    where diario_emocoes.usuario_id = ?
                                                    LIMIT 50`, [usuarioId]);
            return row;
        } catch (error) {
            throw error;
        } finally {
            await connection.end();
        }
    }
}

module.exports = new diarioModel();