const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'crud_alunos'
});


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.urlencoded({extended:false}));

app.get("/cadastrar",function(req,res){
        res.sendFile(__dirname+"/crud_alunos.html");
       
    });

app.listen(8083, function(){
    console.log
    ("Servidor rodando na url http://localhost:8083 ");
});

app.get("/",function(req,res){
    res.sendFile(__dirname+"/pg_inicialAlunos.html");
});


app.post("/cadastrar", function(req,res){
    const nome = req.body.nome;
    const turma = req.body.turma;
    const idade = req.body.idade;
    const email = req.body.email;

    const values = [nome, turma, idade, email];
    const insert = 
        "INSERT INTO alunos (nome, turma, idade, email) VALUES(?, ?, ?, ?)";

    connection.query(insert, values, function(err,result){
        if (err){
            console.error("Dados não inseridos", err);
            res.send("Erro");
        } else {
            console.log("Dados inseridos com sucesso!");
            res.redirect("/listar");
        }
    });
});

app.get("/listar", function(req, res){
    const selectAll = "SELECT * FROM alunos";

    connection.query(selectAll, function(err, rows){
            if(!err){
                res.send(`<html>
                    <head>
                        <title> Lista de alunos </title> </head>
                    <body>
                        <h1> Lista de alunos</h1>
                        <table>
                        <tr>
                            <th>Nome</th>
                            <th>Turma</th>
                            <th>Idade</th>
                            <th>Email</th>
                        </tr>
                        ${rows.map(row=>`
                        <tr>
                            <td>${row.nome}</td>
                            <td>${row.turma}</td>
                            <td>${row.idade}</td>
                            <td>${row.email}</td>
                            <td><a href="/deletar/${row.id}">Excluir</a></td>
                            <td><a href="/atualizar-form/${row.id}">Atualizar</a></td>

                            </tr>`).join('')}
                    </table>
                    <br><br>
                         <a href="/">Menu Principal</a>
                    </body>

                </html>`);
            }else{
                console.error("Erro ao listar os alunos", err);
                res.status(500).send("Erro ao listar os dados")
            }
        });
});

app.get("/deletar/:id", function(req,res){
    const idDoAluno = req.params.id;
    const deleteAluno = "DELETE FROM alunos WHERE id=?"

    connection.query(deleteAluno,[idDoAluno],function(err,rows) {
        if(!err){
          console.log("Aluno excluído com sucesso!");
          res.redirect("/listar");
        }else{
            console.error("Erro ao excluir aluno",err);
            res.status(500).send("Erro ao excluir aluno!");
        }
   });
});

app.post("/atualizar/:id", (req,res) => {

    const update = "UPDATE alunos SET nome = ?, turma = ?, idade = ?, email = ? WHERE id =?";
    const nome = req.body.nome;
    const turma = req.body.turma;
    const idade = req.body.idade;
    const email = req.body.email;
    const id = req.params.id;
    
    connection.query(update, [nome, turma, idade, email, id], 
        function(err, result){
            if(!err){
                console.log("Dados Atualizados com Sucesso!");
                res.redirect("/listar");

            } else {
                console.log("Erro ao atualizar ", err);
                res.status(500).send("Erro ao atualizar!");
            }
            
        });
        
});

app.get("/atualizar-form/:id", function(req,res){
    const id = req.params.id;
    const selectAluno= ("SELECT * FROM alunos WHERE id=?")

    connection.query(selectAluno, [id], function(err, result){
        if(!err && result.length >0){
            const aluno = result[0];

            res.send(`
                <!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Atualizar Cadastro de Alunos</title>
</head>
<body>
    <h1>Atualizar Cadastro de Alunos</h1>

    <form action="/atualizar/${id}" method="POST">
        <label for="nome"> Nome do Aluno</label> <br>
        <input type="text" id="nome" name="nome" required value=${aluno.nome}> <br>
        <br>
         <label for="turma"> Turma</label> <br>
        <input type="text" id="turma" name="turma" required value=${aluno.turma}> <br>
        <br>
         <label for="idade"> Idade</label> <br>
        <input type="number" id="idade" name="idade" value=${aluno.idade} required> <br>
        <br>
         <label for="email"> Email</label> <br>
        <input type="email" id="email" name="email" value=${aluno.email} required> <br>
        <br>
        <input type="submit">
        <br>
        <a href="/listar">Listar alunos</a>

    </form>
</body>
</html>`)
        } else {
            console.log("Erro ao obter dados do aluno", err);
            res.status(500).send("Erro ao obter dados do aluno")
        }
    })
})

