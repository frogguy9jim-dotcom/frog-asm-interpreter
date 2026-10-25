# frog-asm-interpreter
an interpreter for a fictional assembly language called frog assembly, which works with .frga files. \
i know it being an interpreter ruins the point but idc \
\
also keep in mind this project is pretty old so forgive me for some questionable code lol


## how to setup (windows)
once you've downloaded the repo, create a file ending in .frga \
while selecting it press alt+enter and change the default app to "runcode.bat", once you've done that you simply need to double click the file to run it



## how to use

### 1. base sections

frog asm is made up by two sections, .data and .code \
.data is where you declare variables and .code is where you actually write code
```frog asm
.data
	;data section here
.code
	;code section here
.end
```

### 2. declaring variables

to declare a variable, you need to write "EAT $name value" in the data section \
e.g.:
```frog asm
.data
	EAT $number 20
	EAT $string 'this is a string'
.code

.end
```
variables *cannot* be declared in .code


### 3. taking user input and storing it

to take user input, you use the TELL keyword as such:
```frog asm
.data
	TELL $resultingInput 'prompt: '
.code

.end
```
the first argument is which variable to store it in, the second argument is the prompt \
this *cannot* be used in .code


### 4. output

to output to the console you must use the POO keyword \
the POO keyword can be used in both the .data and .code sections
```frog asm
.data
	POO 'hello this is a program'
	EAT $variable 24
.code
	POO $variable	;outputs '24'
.end
```

### 5. basic arithmetic

to do math you use the HMW keyword, which is used like 'HMW operand_1 operation operand_2 var' (the last argument is where to store the result in). all four operations are supported \
complex math (such as '45 / (78 * 2)') is not supported, as well as math with more than two arguments (such as '12 - 45 + 2')
```frog asm
.data
	EAT $number1 23
	EAT $number2 10
.code
	HMW $number1 + $number2 $number1	;$number1 now equals 33
	HMW $number2 + 4 $number2		;$number2 now equals 14
	HMW $number2 + 6 $number1		;$number1 now equals 20
.end
```
this *cannot* be used in .data

### 6. changing a variable to a new value

to do this use the NVM keyword like 'NVM $variable_to_change value' \
e.g.:
```frog asm
.data
	EAT $var = 6
	EAT $var2 = 68
.code
	NVM $var 76		;$var now equals 76
	NVM $var $var2	;$var is now equal to $var, which is 68
.end
```
this *cannot* be used in .data

### 7. handling delays

to use delays, you use the NAP keyword like 'NAP value (in ms)' \
e.g.:
```frog asm
.data
	EAT $ms 1000
.code
	POO 'hello'
	NAP 500
	POO 'you had to wait 500ms to see this message'
	NAP $ms
	POO 'you had to wait 1000ms (relative to the last message) to see this message'
	POO 'this program took 1500ms to finish executing'
.end
```
this *cannot* be used in .data

### 8. control structures

the only control structure is LEAP (works with markers), which is used like 'LEAP marker condition' \
if the condition is true, it jumps to the marker \
conditions support =, >, < and _ ('_' means not equal) \
e.g.:
```frog asm
.data
	TELL $input '> '
.code
	LEAP #skip: $input _ 10
		POO 'your input is 10 hohoho'
		LEAP #program_end: 1 = 1

	#skip:
		POO 'your input is not 10 ):'
	#program_end:
.end
```


## samples!

here are some quick samples i made! (the samples use numbers as variable names cause when i made the language i actually didn't know you could use strings for the names lol)
fibbonacci seqeunce:
```frog asm
.data
	EAT $0 0
	EAT $1 1
	EAT $5 0
	EAT $2 0
	POO 'this program outputs the fibbonacci sequence up to n terms'
	TELL $3 'n: '
	EAT $4 0

.code
	POO $0
	POO $1
	#start:
		HMW $4 + 1 $4
		NVM $2 0
		HMW $2 + $1 $2
		HMW $2 + $0 $2
		POO $2
		NVM $5 $1
		NVM $1 $2
		NVM $0 $5
		LEAP #start: $4 < $3
.end
```
collatz:
```frog asm
.data
	POO 'this program outputs the collatz conjecture'
	TELL $0 'number: '
	EAT $1 0
	EAT $2 0
.code
	NVM $1 $0
	POO $0
	#start:
		HMW $1 % 2 $1
		LEAP #skipEven: $1 = 0
	
		HMW $0 * 3 $0
		HMW $0 + 1 $0
		LEAP #skipOdd: 1 = 1
	
	#skipEven:
	
		HMW $0 / 2 $0
	
	#skipOdd:
	
		NVM $1 $0
		POO $0
	
		LEAP #start: $0 _ 1
.end
```
prime:
```frog asm
.data
	POO 'this program outputs whether the input is prime or composite'
	TELL $0 'input: '
	EAT $1 0
	EAT $2 0
	EAT $3 0
	EAT $4 2

.code
	NVM $1 $0
	NVM $3 $0
	HMW $3 - 1 $3
	LEAP #sCase: $0 = 0
	LEAP #sCase: $0 = 1
	LEAP #prime: $0 = 2
	#start:
		HMW $1 % $4 $1
		LEAP #skipEven: $1 = 0
	
		NVM $1 $0
		HMW $4 + 1 $4
	
		LEAP #start: $4 < $3
	
	#prime:
		POO 'this number is prime'
		LEAP #end: 1 = 1
	
	#sCase:
		POO 'this number is neither prime nor composite'
		LEAP #end: 1 = 1
	
	#skipEven:
		POO 'this number is composite'
	
	#end:
.end

```


