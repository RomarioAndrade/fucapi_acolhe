const {createConnection} = require('../database/db');

class perfilNecessidadesModel {

    //
    async salvePerfilNecessidades(data) {
        const connection = await createConnection();
    }

    async updatePerfilNecessidades() {
        const connection = await createConnection();

    }

    async getAll() {}

    async find(usuarioId) {
        const connection = await createConnection();
        try {
            const [row] = await connection.execute(`
                SELECT  * FROM perfil_necessidades WHERE id_usuario = ?;
            `,[usuarioId]);

        }catch (e) {

        }
    }
}