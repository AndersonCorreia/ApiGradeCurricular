const { config } = require("dotenv")
const { join } = require("path")
const { ok } = require("assert")

const env = process.env.NODE_ENV || "dev"
ok(env == "prod" || env == "dev", " a env é invalida, deve ser dev ou prod")
const configPath = join(__dirname, "./../config", ".env." + env)
config({
    path: configPath
})

//frameworks para documentação da api
const hapiSwagger = require("hapi-swagger")
const Vision = require("vision")
const Inert = require("inert")

const swaggerOptions = {
    info: {
        title: " API - Grade Curricular Ecomp Uefs",
        version: "v1.0"
    },
    lang: "pt"
}

const hapi = require("hapi")
const Rotas = require("./routes/gradeCurricularRoutes")
const DataBase = require("./DataBase/postgres/postgres")
var DisciplinasSchema = require("./DataBase/postgres/schemas/disciplinasSchema")


async function main() {

    var Connection = await DataBase.connect()
    DisciplinasSchema = await DisciplinasSchema(Connection)
    const app = new hapi.Server({ port: process.env.PORT })
    await app.register([Vision, Inert, { plugin: hapiSwagger, options: swaggerOptions }])

    const db = new DataBase(Connection, DisciplinasSchema)
    Rotas.setDataBase(db)
    try {
        await app.route(Rotas.getRoutes())
        await app.start()
        console.log("servidor rodando na porta :", app.info.port, "\n e uri : ", app.info.uri)
    }
    catch (error) {
        console.log(error)
        app.stop({ timeout: 0 })
    }
}
main()
/* função usada anteriormente para adciona dados no banco
function loadDisciplinas() {
    var FileDisciplinas = new readFileSync("src/DataBase/disciplinas.json")
    FileDisciplinas = JSON.parse(FileDisciplinas.toString())
    return FileDisciplinas
}

const { readFileSync } = require("fs")
*/