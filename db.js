var mysql = require('mysql2/promise');
const Table = require('cli-table3');

// Função principal assíncrona
async function main() {
    // 1. Criar o banco de dados
    const connection = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "admin123456"
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS at2`);
    console.log("Banco de dados criado");

    await connection.end();

    // 2. Conectar ao banco de dados e criar tabelas
    const con = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "admin123456",
        database: "at2"
    });

    // 2.1 Criando as tabelas
    const fornecedor = `CREATE TABLE IF NOT EXISTS fornecedor (
                    for_id INT NOT NULL AUTO_INCREMENT,
                    for_nome VARCHAR(50) NOT NULL,
                    for_cidade VARCHAR(50) NOT NULL,
                    for_estado VARCHAR(50) NOT NULL,
                    PRIMARY KEY (for_id)
    )`;

    const fornecedor_ins = `INSERT INTO fornecedor (for_nome, for_cidade, for_estado) VALUES 
                            ("Plasticos Aurora", "São Paulo", "SP"),
                            ("Metalurgica Alvares", "Minas Gerais", "MG"),
                            ("Banco do Sudeste", "Bahia", "MG"),
                            ("Padaria Italia", "Rio Grande do Sul", "RS"),
                            ("Software House Salerno", "São Paulo", "SP")`;

    const produto = `CREATE TABLE IF NOT EXISTS produto (
                    prod_id INT NOT NULL AUTO_INCREMENT,
                    prod_descricao VARCHAR(50) NOT NULL,
                    prod_qtde INT,
                    prod_preco DECIMAL(10,2),
                    for_id INT,
                    PRIMARY KEY (prod_id),
                    FOREIGN KEY (for_id) REFERENCES fornecedor (for_id)
    )`;

    const produto_ins = `INSERT INTO produto (prod_descricao, prod_qtde, prod_preco, for_id) VALUES 
                            ("Polipropileno", 10, 50.0, 1),
                            ("Bobinas Aço", 20, 60.0, 2),
                            ("Empréstimo CG", 30, 70.0, 3),
                            ("Pão Francês", 40, 80.0, 4),
                            ("Software Genérico", 5, 90.0, 5),
                            ("Garrafa plástica", 5, 2.00, 1),
                            ("Pote de sorvete", 15, 3.00, 1)`;

    // 2.2 Conte quantos produtos cada fornecedor
    const qtdeProd = `SELECT f.for_nome, COUNT(p.prod_id) AS qtde_produtos FROM produto p
                      JOIN fornecedor f ON p.for_id = f.for_id
                      GROUP BY f.for_nome`;

    // 2.3 Liste os produtos com preços acima de um determinado valor, mostrando o fornecedor.
    const listProd = `SELECT f.for_nome, p.prod_descricao, p.prod_preco FROM produto p
                      JOIN fornecedor f ON p.for_id = f.for_id
                      WHERE p.prod_preco > 60`;

    await con.query(fornecedor);
    await con.query(produto);
    await con.query(fornecedor_ins);
    await con.query(produto_ins);

    // Executando as consultas
    const [qtdeProdResults] = await con.query(qtdeProd);
    const [listProdResults] = await con.query(listProd);

    // Função para exibir dados em formato de tabela
    function displayTable(data, columns) {
        const table = new Table({
            head: columns,
            colWidths: columns.map(() => 20) // Ajusta a largura das colunas conforme necessário
        });

        data.forEach(row => {
            table.push(Object.values(row));
        });

        console.log(table.toString());
    }

    // Exibindo os resultados em formato de tabela
    console.log("Quantidade de Produtos por Fornecedor:");
    displayTable(qtdeProdResults, ['Fornecedor', 'Quantidade de Produtos']);

    console.log("\nProdutos com Preços Acima de 60:");
    displayTable(listProdResults, ['Fornecedor', 'Descrição do Produto', 'Preço']);

    await con.end();
}

// 3. Chamar a função principal
main().catch(err => {
    console.error("Erro: ", err);
});
