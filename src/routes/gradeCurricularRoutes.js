const joi = require("joi")
const assert = require("assert")
const failAction = (request, headers, error) => {
    throw error //o caso de erro apenas lançar o erro
}

const tipos = ["módulo intregador obrigatório", "Módulo Obrigatório", "Disciplina Obrigatória",
    "TCC", "Estágio", "Projeto Empreendedor", "Optativa Profissionalizante",
    "Optativa de Formação Humanástica", "Optativa de Formação Complementar"]
var _Db = {}
var disciplinas

const list = {
    path: "/disciplinas",
    method: "GET",
    config: {
        tags: ["api"],
        description: " Lista todas as diciplinas",
        notes: "suporte a paginação dos resultados e filtro por nome," +
            " alêm de poder limitar o resultado a disciplinas do tipo especificado\n" +
            "tipos- 1:" + tipos[0] + ", 2:" + tipos[1] + ", 3:" + tipos[2] + ", 4:" + tipos[3] +
            ", 5:" + tipos[4] + ", 6:" + tipos[5] + ", 7:" + tipos[6] + ", 8:" + tipos[7] + ", 9:" + tipos[8],
        validate: {
            failAction,
            query: {
                skip: joi.number().integer().default(0).description("resultados que são ignorados/pulados inicialmente"),
                limit: joi.number().integer().default(10).description("limite de itens por resultado"),
                name: joi.string().max(100).description("nome da disciplina"),
                type: joi.number().integer().optional().max(9).min(0).description("valor de 1 a 9").default(0)
            }
        }
    },
    handler: async (request) => {
        try {
            const { skip, limit, name, type } = request.query
            var query = {}
            if (name) {
                query.Name = name
            }
            if (type) {
                query.Type = type
            }
            var list = await _Db.read(query, skip, limit)
            return list
        }
        catch (error) {
            console.log("error: ", error)
            return {
                message: "error interno no servidor, verifique a URL",
                error: error.message
            }
        }
    }
}
const listPre = {
    path: "/disciplinas/pre/{Cod}",
    method: "GET",
    config: {
        tags: ["api"],
        description: " Lista recursivamente todos os pre requisitos de uma diciplina",
        notes: " o retorno é um array com as informações das diciplinas" +
            "com exceção dos pos/cos-requisitos",
        validate: {
            failAction,
            params: {
                Cod: joi.string().required().min(6).max(7).description("codigo da disciplina")
            }
        }
    },
    handler: async (request) => {
        try {
            return await getRequisitos("Pre", request.params.Cod)
        }
        catch (error) {
            console.log("error: ", error)
            return {
                message: "error interno no servidor, verifique a URL",
                error: error.message
            }
        }
    }
}
const listPos = {
    path: "/disciplinas/pos/{Cod}",
    method: "GET",
    config: {
        tags: ["api"],
        description: " Lista recursivamente todos os pos-requisitos de uma diciplina",
        notes: " o retorno é um array com as informações das diciplinas" +
            "com exceção dos pres/cos-requisitos",
        validate: {
            failAction,
            params: {
                Cod: joi.string().required().min(6).max(7).description("codigo da disciplina")
            }
        }
    },
    handler: async (request) => {
        try {
            return await getRequisitos("Pos", request.params.Cod)
        }
        catch (error) {
            console.log("error: ", error)
            return {
                message: "error interno no servidor, verifique a URL",
                error: error.message
            }
        }
    }
}
const listCo = {
    path: "/disciplinas/co/{Cod}",
    method: "GET",
    config: {
        tags: ["api"],
        description: " Lista recursivamente todos os co-requisitos de uma diciplina",
        notes: " o retorno é um array com as informações das diciplinas" +
            "com exceção dos pos/pre-requisitos",
        validate: {
            failAction,
            params: {
                Cod: joi.string().required().min(6).max(7).description("codigo da disciplina")
            }
        }
    },
    handler: async (request) => {
        try {
            const cod = request.params.Cod
            const Dis = await disciplinas.find((obj) => {
                return (obj.Cod.toLowerCase() == cod.toLowerCase())
            })
            if (!Dis) {
                throw new Error("disciplina não encontrada")
            }
            var result = { Cod: Dis.Cod, Name: Dis.Name, Type: Dis.Type, Ch: Dis.Ch, Ementa: Dis.Ementa }
            result.Co = []
            for (let i = 0; i < Dis.Co.length; i++) {//tirando o encadeamento circular da estrutura 
                let c = Dis.Co[i]
                result.Co[i] = { Cod: c.Cod, Name: c.Name, Type: c.Type, Ch: c.Ch, Ementa: c.Ementa }
            }
            return result
        }
        catch (error) {
            console.log("error: ", error)
            return {
                message: "error interno no servidor, verifique a URL",
                error: error.message
            }
        }
    }
}
const create = {
    path: "/disciplinas",
    method: "POST",
    config: {
        tags: ["api"],
        description: " cadastra uma disciplina",
        validate: {
            failAction,
            payload: {
                Cod: joi.string().required().min(6).max(7).description("codigo da disciplina"),
                Name: joi.string().required().max(100).description("nome da disciplina"),
                Ch: joi.number().integer().required().description("Carga horaria"),
                Type: joi.number().integer().required().max(9).description("tipo da disciplina"),
                Pre: joi.array().description("pre-requisitos da diciplina"),
                Pos: joi.array().description("posrequisitos da diciplina"),
                Co: joi.array().description("co-requisitos da diciplina"),
                Ementa: joi.string().description("ementa da disciplina")
            }
        }
    },
    handler: async (request) => {
        try {
            const item = { Cod, Name, Ch, Type, Pre, Pos, Co, Ementa } = request.payload
            var id = _Db.create(item)
            disciplinas = getList(await _Db.read({}, 0, 0, false))
            return {
                message: "disciplina cadastrada com sucesso",
                _id: id
            }
        }
        catch (error) {
            console.log("error: ", error)
            return {
                message: "error interno no servidor, verifique a URL",
                error: error
            }
        }
    }
}
const update = {
    path: "/disciplinas/{Cod}",
    method: "PATCH",
    config: {
        tags: ["api"],
        description: " atualiza uma disciplina",
        notes: " pode atualizar qualquer campo",
        validate: {
            params: {
                Cod: joi.string().required().min(6).max(7).description("codigo da disciplina")
            },
            payload: {
                Cod: joi.string().min(6).max(7).description("codigo da disciplina"),
                Name: joi.string().max(100).description("nome da disciplina"),
                Ch: joi.number().integer().description("Carga horaria"),
                Type: joi.number().integer().max(9).description("tipo da disciplina"),
                Pre: joi.array().description("pre-requisitos da diciplina"),
                Pos: joi.array().description("posrequisitos da diciplina"),
                Co: joi.array().description("co-requisitos da diciplina"),
                Ementa: joi.string().description("ementa da disciplina")
            }
        }
    },
    handler: async (request) => {
        try {
            const item = { Cod, Name, Ch, Type, Pre, Pos, Co, Ementa } = request.payload
            const query = { Cod: request.params.Cod }
            var qtd = _Db.update(query, item)

            if (qtd == 0) {
                throw new Error("Disciplina não encontrada")
            }
            disciplinas = getList(await _Db.read({}, 0, 0, false))

            return {
                message: "disciplina cadastrada com sucesso",
                qtd: qtd //quantidade de itens atualizados
            }
        }
        catch (error) {
            console.log("error: ", error)
            return {
                message: "error interno no servidor, verifique a URL",
                error: error
            }
        }
    }
}
async function setDataBase(db) {
    _Db = db
    disciplinas = getList(await db.read({}, 0, 0, false))
}

function getRoutes() {
    return [list, listPre, listPos, listCo, create, update]
}
module.exports = { setDataBase, getRoutes }

/**
Transformar o array com os dados em uma estrutura de Grafo, os valores dos array pre,pos,co
são substituidos da sequinte forma, as strings nos array`s que são Codigos de outras diciplinas são substituidas pelo objeto da
disciplina correspondente. Quando algum metodo que altera o banco de dados é executado este metodo é chamado novamente.

@param FileDisciplinas estrutura de dados completa que estava salva no banco de dados
 
**/
function getList(FileDisciplinas) {
    FileDisciplinas.map((item) => {
        item.Type = tipos[item.Type - 1]
        encadear(FileDisciplinas, item, "Pre")
        encadear(FileDisciplinas, item, "Pos")
        encadear(FileDisciplinas, item, "Co")
    })
    return FileDisciplinas
}
function encadear(File, item, property) {
    for (var i = 0; i < item[property].length; i++) {
        item[property][i] = File.find((obj) => { return obj.Cod == item[property][i] })
    }
}

async function getRequisitos(property, Cod) {
    const Dis = disciplinas.find((obj) => { return obj.Cod.toLowerCase().includes(Cod.toLowerCase()) })
    if (!Dis) {
        throw new Error("disciplina não encontrada", Dis)
    }
    var PreDis = {}
    await getRequisitosRecursive(PreDis, Dis, property)
    return PreDis
}

function getRequisitosRecursive(list, disciplina, property) {
    list.Cod = disciplina.Cod
    list.Name = disciplina.Name
    list.Ch = disciplina.Ch
    list.Type = disciplina.Type
    list.Ementa = disciplina.Ementa
    list[property] = new Array(disciplina[property].lenght)
    for (let index = 0; index < disciplina[property].length; index++) {
        list[property][index] = {}
        assert.notStrictEqual(list[property][index], disciplina[property][index])
        getRequisitosRecursive(list[property][index], disciplina[property][index], property)
    }
}
