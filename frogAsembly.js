const fs = require('fs');
const path = require('path');

cAST = {}
tokenCode = []

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const filePath = process.argv[2];

if (!filePath) {
    console.error("no file loaded");
    process.exit(1);
}

try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    console.log(path.basename(filePath))
    console.log('frogAssembly interpreter v1.0.6')
    commandLine(fileContent, cAST, tokenCode, filePath)
    
    setTimeout(() => {}, 5000);
} catch (error) {
    console.error("Error reading file:", error.message);
    setTimeout(() => {}, 5000);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function interpret(rawcode) {
    let unfilteredCode = Array.from(rawcode)
    let unjoinedCode = []
    tokenCode = []
    for (let i = 0; i < unfilteredCode.length; i++) {
        if (unfilteredCode[i] != '\r' && unfilteredCode[i] != '\n' && unfilteredCode[i] != '\t') {
            unjoinedCode.push(unfilteredCode[i])
        } else if (unfilteredCode[i] == '\n') {
            unjoinedCode.push(' ')
        }
    }

    ///////////////////// SPLIT INTO TOKENS
    for (let i = 0; i < unjoinedCode.length; i++) {
        if (unjoinedCode[i] == '.' && unjoinedCode[i+1] == 'd' && unjoinedCode[i+2] == 'a' && unjoinedCode[i+3] == 't' && unjoinedCode[i+4] == 'a') {
            i += 5
            tokenCode.push('.data')
        }
        else if (unjoinedCode[i] == '.' && unjoinedCode[i+1] == 'c' && unjoinedCode[i+2] == 'o' && unjoinedCode[i+3] == 'd' && unjoinedCode[i+4] == 'e') {
            i += 5
            tokenCode.push('.code')
        }
        else if (unjoinedCode[i] == '.' && unjoinedCode[i+1] == 'e' && unjoinedCode[i+2] == 'n' && unjoinedCode[i+3] == 'd') {
            i += 5
            tokenCode.push('.end')
        }

        if (unjoinedCode[i] == 'E' && unjoinedCode[i+1] == 'A' && unjoinedCode[i+2] == 'T') {
            i += 3
            tokenCode.push('EAT')
        }
        if (unjoinedCode[i] == 'T' && unjoinedCode[i+1] == 'E' && unjoinedCode[i+2] == 'L' && unjoinedCode[i+3] == 'L') {
            i += 4
            tokenCode.push('TELL')
        }
        else if (unjoinedCode[i] == 'P' && unjoinedCode[i+1] == 'O' && unjoinedCode[i+2] == 'O') {
            i += 3
            tokenCode.push('POO')
        }
        else if (unjoinedCode[i] == 'N' && unjoinedCode[i+1] == 'A' && unjoinedCode[i+2] == 'P') {
            i += 3
            tokenCode.push('NAP')
        }
        else if (unjoinedCode[i] == 'L' && unjoinedCode[i+1] == 'E' && unjoinedCode[i+2] == 'A' && unjoinedCode[i+3] == 'P') {
            i += 4
            tokenCode.push('LEAP')
        }
        else if (unjoinedCode[i] == 'H' && unjoinedCode[i+1] == 'M' && unjoinedCode[i+2] == 'W') {
            i += 3
            tokenCode.push('HMW')
        }
        else if (unjoinedCode[i] == 'N' && unjoinedCode[i+1] == 'V' && unjoinedCode[i+2] == 'M') {
            i += 3
            tokenCode.push('NVM')
        }

        if (unjoinedCode[i] == '+') {
            tokenCode.push('+')
        }
        if (unjoinedCode[i] == '-') {
            tokenCode.push('-')
        }
        if (unjoinedCode[i] == '*') {
            tokenCode.push('*')
        }
        if (unjoinedCode[i] == '/') {
            tokenCode.push('/')
        }

        if (unjoinedCode[i] == '>') {
            tokenCode.push('>')
        }
        if (unjoinedCode[i] == '<') {
            tokenCode.push('<')
        }
        if (unjoinedCode[i] == '=') {
            tokenCode.push('=')
        }
        if (unjoinedCode[i] == '_') {
            tokenCode.push('_')
        }
        if (unjoinedCode[i] == '%') {
            tokenCode.push('%')
        }

        if (unjoinedCode[i] == '$') {
            for (let j = i; j < unjoinedCode.length; j++) {
                if (unjoinedCode[j] == ' ') {
                    tokenCode.push(unjoinedCode.slice(i, j).join(''))
                    i += j-i
                    break
                }
            }
        }
        if (unjoinedCode[i] == '#') {
            for (let j = i; j < unjoinedCode.length; j++)  {
                if (unjoinedCode[j] == ':') {
                    tokenCode.push(unjoinedCode.slice(i, j).join(''))
                    i += j-i
                    break
                }
            }
        }
        if (unjoinedCode[i] == '0' || unjoinedCode[i] == '1' || unjoinedCode[i] == '2' || unjoinedCode[i] == '3' || unjoinedCode[i] == '4' || unjoinedCode[i] == '5' || unjoinedCode[i] == '6' ||unjoinedCode[i] == '7' || unjoinedCode[i] == '8' || unjoinedCode[i] == '9') {
            for (let j = i; j < unjoinedCode.length; j++)  {
                if (unjoinedCode[j] == ' ') {
                    tokenCode.push(Number(unjoinedCode.slice(i, j).join('')))
                    i += j-i
                    break
                }
            }
        }
        if (unjoinedCode[i] == "'") {
            for (let j = i+1; j < unjoinedCode.length; j++)  {
                if (unjoinedCode[j] == "'") {
                    tokenCode.push(`@${unjoinedCode.slice(i+1, j).join('')}`)
                    i += (j-i)+1
                    break
                }
            }
        }
    }


    ////////////////////////// ABSTRACT SYNTAX TREE
    cAST = {}
    let sections = {'data': [], 'code': []}
    markerPos = {}
    cmdCount = 0
    for (let i = 0; i < tokenCode.length; i++) {
        if (tokenCode[i] == '.data') {
            cAST.data = []
            for (let j = i; j < tokenCode.length; j++) {
                if (tokenCode[j] == '.code') {
                    sections.data = tokenCode.slice(i+1, j)
                    i += j-1
                }
            }

            for (let k = 0; k < sections.data.length; k++) {
                switch (sections.data[k]) {
                    case 'EAT':
                        cAST.data.push({'type': 'EAT', 'register': sections.data[k+1], 'value': sections.data[k+2]})
                        break
                    case 'TELL':
                        cAST.data.push({'type': 'TELL', 'register': sections.data[k+1], 'message': sections.data[k+2]})
                        break
                    case 'POO':
                        cAST.data.push({'type': 'DATA-POO', 'register': sections.data[k+1]})
                        break
                }
            }
        }

        if (tokenCode[i] == '.code') {
            cAST.code = []
            for (let j = i; j < tokenCode.length; j++) {
                if (tokenCode[j] == '.end') {
                    sections.code = tokenCode.slice(i+1, j)
                    i += j-1
                }
            }

            for (let k = 0; k < sections.code.length; k++) {
                switch (sections.code[k]) {
                    case 'POO':
                        cAST.code.push({'type': 'POO', 'register': sections.code[k+1]})
                        k += 1
                        cmdCount++
                        break
                    case 'HMW':
                        cAST.code.push({'type': 'HMW', 'operand1': sections.code[k+1], 'operand2': sections.code[k+3], 'operation': sections.code[k+2], 'result_register': sections.code[k+4]})
                        k += 4
                        cmdCount++
                        break
                    case 'NAP':
                        cAST.code.push({'type': 'NAP', 'value': sections.code[k+1]})
                        k += 1
                        cmdCount++
                        break
                    case 'NVM':
                        cAST.code.push({'type': 'NVM', 'register': sections.code[k+1], 'value': sections.code[k+2]})
                        k += 1
                        cmdCount++
                        break
                    case 'LEAP':
                        cAST.code.push({'type': 'LEAP', 'marker': sections.code[k+1], 'operand1': sections.code[k+2], 'operand2': sections.code[k+4], 'comparison': sections.code[k+3]})
                        k += 4
                        cmdCount++
                        break
                }
                if (Array.from(sections.code[k])[0] == '#') {
                    cAST.code.push({'type': 'marker', 'name': sections.code[k]})
                    cmdCount++
                    markerPos[sections.code[k]] = cmdCount - 1
                }
            }
        }
    }



    /////////////////////// RUN PROGRAM
    registers = {}
    let operands = [0, 0]

    for (let i = 0; i < cAST.data.length; i++) {
        if (cAST.data[i].type == 'EAT') {
            registers[cAST.data[i].register] = cAST.data[i].value
        }
        if (cAST.data[i].type == 'TELL') {
            await askInput(cAST.data[i].register, registers, cAST, i, cAST.data[i].message.slice(1))
        }
        if (cAST.data[i].type == 'DATA-POO') {
            if (cAST.data[i].register.startsWith('$')) {
                if (typeof registers[cAST.data[i].register] === 'number') {
                    console.log(registers[cAST.data[i].register])
                } else {
                    console.log(registers[cAST.data[i].register].slice(1))
                }
            } else if (cAST.data[i].register.startsWith('@')) {
                console.log(cAST.data[i].register.slice(1))
            }
        }
    }

    for (let i = 0; i < cAST.code.length; i++) {
        switch (cAST.code[i].type) {
            case 'POO':
                if (cAST.code[i].register.startsWith('$')) {
                    if (typeof registers[cAST.code[i].register] === 'number') {
                        console.log(registers[cAST.code[i].register])
                    } else {
                        console.log(registers[cAST.code[i].register].slice(1))
                    }
                } else if (cAST.code[i].register.startsWith('@')) {
                    console.log(cAST.code[i].register.slice(1))
                }
                break
            case 'NVM':
                if (typeof cAST.code[i].value == 'string') {
                    registers[cAST.code[i].register] = registers[cAST.code[i].value]
                } else {
                    registers[cAST.code[i].register] = cAST.code[i].value
                }
                break
            case 'NAP':
                if (typeof cAST.code[i].operand2 == 'string') {
                    await sleep(registers[cAST.code[i].value])
                } else {
                    await sleep(cAST.code[i].value)
                }
                break
            case 'HMW':
                if (typeof cAST.code[i].operand1 == 'string') {
                    operands[0] = registers[cAST.code[i].operand1]
                } else {
                    operands[0] = cAST.code[i].operand1
                }
                if (typeof cAST.code[i].operand2 == 'string') {
                    operands[1] = registers[cAST.code[i].operand2]
                } else {
                    operands[1] = cAST.code[i].operand2
                }

                switch (cAST.code[i].operation) {
                    case '+':
                        registers[cAST.code[i].result_register] = operands[0] + operands[1]
                        break
                    case '-':
                        registers[cAST.code[i].result_register] = operands[0] - operands[1]
                        break
                    case '*':
                        registers[cAST.code[i].result_register] = operands[0] * operands[1]
                        break
                    case '/':
                        registers[cAST.code[i].result_register] = operands[0] / operands[1]
                        break
                    case '%':
                        registers[cAST.code[i].result_register] = operands[0] % operands[1]
                        break
                }
                break
            case 'LEAP':
                if (typeof cAST.code[i].operand1 == 'string') {
                    operands[0] = registers[cAST.code[i].operand1]
                } else {
                    operands[0] = cAST.code[i].operand1
                }
                if (typeof cAST.code[i].operand2 == 'string') {
                    operands[1] = registers[cAST.code[i].operand2]
                } else {
                    operands[1] = cAST.code[i].operand2
                }


                switch (true) {
                    case (cAST.code[i].comparison == '<' && operands[0] < operands[1]):
                        i = markerPos[cAST.code[i].marker]
                        continue
                    case (cAST.code[i].comparison == '>' && operands[0] > operands[1]):
                        i = markerPos[cAST.code[i].marker]
                        continue
                    case (cAST.code[i].comparison == '=' && operands[0] == operands[1]):
                        i = markerPos[cAST.code[i].marker]
                        continue
                    case (cAST.code[i].comparison == '_' && operands[0] != operands[1]):
                        i = markerPos[cAST.code[i].marker]
                        continue
                }
                break
        }
    }
    commandLine(rawcode, cAST, tokenCode, filePath)
}

function askInput(register, registers, cAST, i, msg) {
    return new Promise((resolve) => {
        rl.question(msg, (input) => {
            registers[cAST.data[i].register] = Number(input)
            resolve()
        })
    })
}

function commandLine(fileContent, cAST, tokenCode, filePath) {
    rl.question(`>`, (input) => {
        if (input == 'help') {
            console.log('')
            console.log('HELP MENU')
            console.log('')
            console.log('run            -- run your selected file')
            console.log('view file      -- view your selected files contents')
            console.log('view file path -- view the file path of your selected file')
            console.log('view tokens    -- view the generated tokens of your selected file')
            console.log('view AST       -- view the generated AST of your selected file')
            console.log('clear          -- clear the console')
            console.log('close          -- close the console')
            console.log('help           -- show this menu')
            console.log('')
            commandLine(fileContent, cAST, tokenCode, filePath)
        } else if (input == 'run') {
            interpret(fileContent)
            return
        } else if (input == 'view file') {
            console.log('')
            console.log("file contents:")
            console.log(fileContent)
            console.log('')
            commandLine(fileContent, cAST, tokenCode, filePath)
        }
        else if (input == 'view file path') {
            console.log('')
            console.log(filePath)
            console.log('')
            commandLine(fileContent, cAST, tokenCode, filePath)
        }
        else if (input == 'view tokens') {
            if (tokenCode.length == 0) {
                console.log('')
                console.log('run your file before you can view the generated tokens')
                console.log('')
                commandLine(fileContent, cAST, tokenCode, filePath)
            } else {
                console.log('')
                console.log('tokens:')
                console.log(tokenCode)
                console.log('')
                commandLine(fileContent, cAST, tokenCode, filePath)
            }
        } else if (input == 'view AST') {
            if (cAST.data == undefined) {
                console.log('')
                console.log('run your file before you can view the generated AST')
                console.log('')
                commandLine(fileContent, cAST, tokenCode, filePath)
            } else {
                console.log('')
                console.log('AST:')
                console.log(cAST)
                console.log('')
                commandLine(fileContent, cAST, tokenCode, filePath)
            }
        }
        else if (input == 'clear') {
            readline.cursorTo(process.stdout, 0, 0);
            readline.clearScreenDown(process.stdout);
            console.log(path.basename(filePath))
            console.log('frogAssembly interpreter v1.0.6')
            commandLine(fileContent, cAST, tokenCode, filePath)
        }
        else if (input == 'close') {
            process.exit(0)
        }
        else if (input == '') {
            commandLine(fileContent, cAST, tokenCode, filePath)
        }
        else {
            console.log('')
            console.error(`${input} is an invalid command`)
            console.log('')
            commandLine(fileContent, cAST, tokenCode, filePath)
        }
    });
}
