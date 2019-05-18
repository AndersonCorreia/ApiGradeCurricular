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
var Connection// = DataBase.connect()
var DisciplinasSchema = require("./DataBase/postgres/schemas/disciplinasSchema")
//DisciplinasSchema = DisciplinasSchema(Connection)

async function main() {

    const app = new hapi.Server({ port: process.env.PORT })
    await app.register([Vision, Inert, { plugin: hapiSwagger, options: swaggerOptions }])

    const db = new DataBase(Connection, DisciplinasSchema)
    Rotas.setDataBase(db)
    try {
        await app.route(Rotas.getRoutes())
        await app.start()
        console.log("servidor rodando na porta :", app.info.port, "\n e uri : ", app.info.uri)
        const d = loadDisciplinas()
        /*console.log( (await app.inject({
            method: "POST",
            url: "/disciplinas",
            payload: d[0]
        })).result)

        app.stop({ timeout: 0 })*/
    }
    catch (error) {
        console.log(error)
        app.stop({ timeout: 0 })
    }
}
main()

function loadDisciplinas() {
    var FileDisciplinas = new readFileSync("src/DataBase/disciplinas.json")
    FileDisciplinas = JSON.parse(FileDisciplinas.toString())
    /*FileDisciplinas.map((item) => {
        encadear(FileDisciplinas, item, "pre")
        encadear(FileDisciplinas, item, "pos")
        encadear(FileDisciplinas, item, "co")
    })*/
    return FileDisciplinas
}
function encadear(File, item, property) {
    for (var i = 0; i < item[property].length; i++) {
        item[property][i] = File.find((obj) => { return obj.Cod == item[property][i] })
    }
}
const { readFileSync, writeFile } = require("fs")