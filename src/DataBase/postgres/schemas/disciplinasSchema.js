const Sequelize = require('sequelize')

async function getDisciplinasSchema(conection){
    
    const disciplinas = conection.define("disciplinas", {
        Cod: { //codigo da disciplina
            type: Sequelize.STRING,
            required: true , //não pode ser null
            primaryKey: true, // chave de buscar primaria
        },
        Name: { //nome da disciplina
            type: Sequelize.STRING,
            required : true
        },
        Ch: { // carga horaria da disciplina
            type : Sequelize.INTEGER,
            required : true
        },
        Type: { //tipo da disciplina, ex: obrigatoria,optativa humanisticas e etc
            type: Sequelize.INTEGER,
            required: true
        },
        Pre: { // array com os pre-requisitos da disciplina
            type: Sequelize.ARRAY(Sequelize.STRING),
            required: true,
            references: {
                model: "disciplinas"
            }
        },
        Pos: { // array com os pos-requisitos da disciplina
            type: Sequelize.ARRAY,
            required: true
        },
        Co: { // array com os co-requisitos da disciplina
            type: Sequelize.ARRAY,
            required: true
        },
        Ementa: {
            type: Sequelize.TEXT,
        }
    },{
        tableName: "TB_DISCIPLINAS_ECOMP",// nome da tabela existente no banco
        freezeTableName: false, //manter as configurações do banco existente
        timestamps: false
    })
    await disciplinas.sync()//conectando ao banco
    return disciplinas
}

module.exports = getDisciplinasSchema