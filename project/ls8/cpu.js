/**
 * LS-8 v2.0 emulator skeleton code
 */

// Instructions 
const ADD = 0b10101000;
const AND = 0b10110011;
const CALL = 0b01001000;
const CMP = 0b101000000;
const DEC = 0b01111001;
const DIV = 0b10101011;
const HLT = 0b00000001;
const INC = 0b01111000;
const INT = 0b01001010;
const IRET = 0b00001011;
const JEQ = 0b01010001;
const JGT = 0b01010100;
const JLT = 0b01010011;
const JMP = 0b01010000;
const JNE = 0b01010010;
const LD  = 0b10011000;
const LDI = 0b10011001;
const MOD = 0b10101100;
const MUL = 0b10101010;
const NOP  = 0b00000000;
const NOT  = 0b01110000;
const OR   = 0b10110001;
const POP  = 0b01001100;
const PRA  = 0b01000010;
const PRN  = 0b01000011;
const PUSH = 0b01001101;
const RET  = 0b00001001;
const ST   = 0b10011010;
const SUB  = 0b10101001;
const XOR  = 0b10110010;

const FL = 4;
const IM = 5;
const IS = 6;
const SP = 7;

const FLAG_E = 0;
const FLAG_G = 1;
const FLAT_L = 2;

const vecTableStart = 0xF8;

const intMask = [
  (ox1 << 0),
  (0x1 << 1),
];


/**
 * Class for simulating a simple Computer (CPU & memory)
 */
class CPU {
  /**
   * Initialize the CPU
   */
  constructor(ram) {
    this.ram = ram;

    this.reg = new Array(8).fill(0); // General-purpose registers R0-R7

    // Special-purpose registers
    this.reg.PC = 0; // Program Counter
    this.reg.FL = 0;
    this.reg.IR = 0;

    this.reg[SP] = 0xf4;

    this.busy = false;
    this.interruptsEnable = true;
  }

  /**
   * Store value in memory address, useful for program loading
   */
  poke(address, value) {
    this.ram.write(address, value);
  }

  raiseInterrupt(n) {
    this.reg[IS] |= intMask[n];
  }

  /**
   * Starts the clock ticking on the CPU
   */
  startClock() {
    this.clock = setInterval(() => {
      this.tick();
    }, 1); // 1 ms delay == 1 KHz clock == 0.000001 GHz

    this.interruptTimer = setInterval(() => {
      this.raiseInterrupt(0);
    }, 1000);
  }

  setFlag(flag) {
    this.reg.FL = 0b1 << flag;
  }

  checkFlag(flag) {
    return (this.reg.FL & (ob1 << flag)) !== 0;
  }

  /**
   * Stops the clock
   */
  stopClock() {
    clearInterval(this.clock);
    clearInterval(this.interruptTimer);
  }

  /**
   * ALU functionality
   *
   * The ALU is responsible for math and comparisons.
   *
   * If you have an instruction that does math, i.e. MUL, the CPU would hand
   * it off to it's internal ALU component to do the actual work.
   *
   * op can be: ADD SUB MUL DIV INC DEC CMP
   */
  alu(op, regA, regB) {
    switch (op) {
      case 'ADD':
      this.reg[regA] += this.reg[regB];
      break;
      case 'AND':
      this.reg[regA] &= this.reg[regB];
      break;
      case 'CMP':
      if (this.reg[regA] > this.reg[regB]) this.setFlag(FLAG_G);
      if (this.reg[regA] < this.reg[regB]) this.setFlag(FLAG_L);
      if (this.reg[regA] === this.reg[regB]) this.setFlag(FLAG_E);
      break;
      case 'DEC':
      this.reg[regA] -= 1;
      break;
      case 'DIV':
      if (this.reg[regB] === 0) {
        console.error('Cannot divide by zero');
        this.stopClock();
      } else {
        this.reg[regA] /= this.reg[regB];
      }
      break;
      case 'INC':
      this.reg[regA] += 1;
      break;
      case 'MOD':
      if (this.reg[regB] === 0) {
        console.error('Cannot divide by zero');
        this.stopClock();
      } else {
        this.reg[regA] %= this.reg[regB];
      }
      break;
      case 'MUL':
      this.reg[regA] = ~this.reg[regA];
      break;
      case 'OR':
      this.reg[regA] |= this.reg[regB];
      break;
      case 'SUB':
      this.reg[regA] |= this.reg[regB];
      break;
      case 'XOR':
      this.reg[regA] ^= this.reg[regB];
      break;
    }
  }

  /**
   * Advances the CPU one cycle
   */
  tick() {

    const _push = item => {
      this.alu('DEC', SP);
      this.ram.write(this.reg[SP], item);

    }

    const _pop = () => {
      const value = this.ram.read(this.reg[SP]);
      this.alu('INC', SP);
      return value;

    }

    if (this.interruptsEnabled) {
      const maskedInts = this.reg[IS] & this.reg[IM];

      for (let i = 0; i < 8; i++) {
        if (((maskedInnts >> i) & 0x01) === 1) {
          this.interruptsEnabled = false;

          this.reg[IS] &= ~intMask[i];
          _push(this.reg.PC);
          _push(this.reg.FL);
          for (let r = 0; r <= 6; r++) {
            _push(this.reg[r]);
          }
          const vec = this.ram.read(vecTableStart + i);
          this.reg.PC = vec;
          break;
        }
      }
    }
  }
  
    // Load the instruction register (IR--can just be a local variable here)
    // from the memory address pointed to by the PC. (I.e. the PC holds the
    // index into memory of the instruction that's about to be executed
    // right now.)

    // !!! IMPLEMENT ME

    // Debugging output
    //console.log(`${this.PC}: ${IR.toString(2)}`);

    // Get the two bytes in memory _after_ the PC in case the instruction
    // needs them.

    // !!! IMPLEMENT ME
    const operandA = this.ram.read(this.reg.PC + 1);
    const operandB = this.ram.read(this.reg.PC + 2);

    // Execute the instruction. Perform the actions for the instruction as
    // outlined in the LS-8 spec.

    switch(this.reg.IR) {
            case ADD:
              this.alu('ADD', operandA, operandB);
              break;
            case AND:
              this.alu('AND', operandA, operandB);
              break;
            case CALL:
              _push(this.reg.PC + 2);
              this.reg.PC = this.reg[operandA];
              this.busy = true;
              break;
            case HLT:
              this.stopClock();
              break;
            case LDI:
              this.reg[operandA] = operandB;
              break;
            case PRN:
              console.log(this.reg[operandA]);
              break;
            case MUL:
              this.alu('MUL', operandA, operandB);
              break;
            case PUSH:
              this.reg[SP]--;
              this.ram.write(this.reg[SP], this.reg[operandA]);
              break;
            case POP:
              this.reg[operandA] = this.ram.read(this.reg[SP]);
              this.reg[SP]++;
              break;
            case RET:
              this.reg.PC = this.ram.read(this.reg[SP]);
              return this.ram.read(this.reg[SP]);
              break;
            case IRET:
              for (let r = 6; r >= 0; r--) {
                this.reg[r] = _pop();
              }
              this.reg.FL = _pop();
              this.reg.PC = _pop();
              this.busy = true;
              this.interruptsEnabled = true;
              break;
            case ST:
              this.ram.write(this.reg[operandA], this.reg[operandB]);
              break;
            case JMP:
              this.reg.PC = this.reg[operandA];
              this.busy = true;
              break;
            case PRA:
              console.log(String.fromCharCode(this.reg[operandA]));
              break;
            case NOP:
              break;
            default:
              let instError = this.reg.IR.toString(2);
              instError = '00000000'.substr(instError.length) + instError;
              console.error(`Error, unknown instruction at PC ${this.reg.PC} : ${instError}`)
              this.stopClock();
              break;
          }
    // !!! IMPLEMENT ME

    // Increment the PC register to go to the next instruction. Instructions
    // can be 1, 2, or 3 bytes long. Hint: the high 2 bits of the
    // instruction byte tells you how many bytes follow the instruction byte
    // for any particular instruction.

    // !!! IMPLEMENT ME
    if (!this.busy) {
      this.reg.PC += (this.reg.IR >>> 6) + 1;
    }
    this.busy = false;

module.exports = CPU;
