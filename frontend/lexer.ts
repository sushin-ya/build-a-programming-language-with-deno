// Let x = 45 + {foo * bar}
// [LetToken, IdentifierTk, EqualLsToken , NumberToken]

export enum TokenType {
  Number,
  Identifier,
  Equals,
  OpenParen,
  CloseParen,
  BinaryOperator,
  Let,
  EOF, // Signified the end of file
}

const KEYWORDS: Record<string, TokenType> = {
  let: TokenType.Let,
};

export interface Token {
  value: string;
  type: TokenType;
}

function token(value = "", type: TokenType): Token {
  return { value, type };
}

function isalpha(src: string): boolean {
  return src.toUpperCase() != src.toLowerCase();
}

function isslippable(str: string): boolean {
  return str == " " || str == "\n" || str == "\t";
}

function isint(str: string): boolean {
  const c = str.charCodeAt(0);
  const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];
  return c >= bounds[0] && c <= bounds[1];
}

export function tokenize(sourceCode: string): Token[] {
  const tokens = new Array<Token>();
  const src = sourceCode.split("");

  // Build each token until end of file
  while (src.length > 0) {
    if (src[0] == "(") {
      tokens.push(token(src.shift(), TokenType.OpenParen));
    } else if (src[0] == ")") {
      tokens.push(token(src.shift(), TokenType.CloseParen));
    } else if (
      src[0] == "+" ||
      src[0] == "-" ||
      src[0] == "*" ||
      src[0] == "/" ||
      src[0] == "%"
    ) {
      tokens.push(token(src.shift(), TokenType.BinaryOperator));
    } else if (src[0] == "=") {
      tokens.push(token(src.shift(), TokenType.Equals));
    } else {
      // Handle multi character tokens

      // Build number token
      if (isint(src[0])) {
        let num = "";
        while (src.length > 0 && isint(src[0])) {
          num += src.shift();
        }

        tokens.push(token(num, TokenType.Number));
      } else if (isalpha(src[0])) {
        let ident = ""; // 変数fooなのか、変数宣言のLetなのかわからない
        while (src.length > 0 && isalpha(src[0])) {
          ident += src.shift();
        }

        // check for reserved keywords
        const reserved = KEYWORDS[ident];
        if (typeof reserved == "number") {
          tokens.push(token(ident, reserved));
        } else {
          tokens.push(token(ident, TokenType.Identifier));
        }
      } else if (isslippable(src[0])) {
        src.shift(); // SKIP THE CURRENT CHARACTER
      } else {
        console.log("Unrecognized character found in source: ", src[0]);
        Deno.exit(1);
      }
    }
  }

  tokens.push({ type: TokenType.EOF, value: "EndOffFile" });
  return tokens;
}

// 実行関数
export async function runLexer() {
  const source = await Deno.readTextFile("./frontend/test.txt");
  for (const token of tokenize(source)) {
    console.log(token);
  }
}

runLexer();
