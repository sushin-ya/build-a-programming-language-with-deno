import { Property } from "./ast.ts";
import { ObjectLiteral } from "./ast.ts";
import {
  Stmt,
  Program,
  Expr,
  BinaryExpr,
  NumericLiteral,
  Identifier,
  VarDeclaration,
  AssignmentExpr,
} from "./ast.ts";
import { tokenize, Token, TokenType } from "./lexer.ts";

export default class Parser {
  private tokens: Token[] = [];

  private not_eof(): boolean {
    return this.tokens[0].type != TokenType.EOF;
  }

  private at() {
    return this.tokens[0] as Token;
  }

  private eat() {
    const prev = this.tokens.shift() as Token;
    return prev;
  }

  // deno-lint-ignore no-explicit-any
  private expect(type: TokenType, err: any) {
    const prev = this.tokens.shift();
    if (!prev || prev.type != type) {
      console.error("Parser Error\n", err, prev, "Expecting ", type);
      Deno.exit(1);
    }

    return prev;
  }

  public produceAST(sourceCode: string): Program {
    this.tokens = tokenize(sourceCode);
    const program: Program = {
      kind: "Program",
      body: [],
    };

    // Parse until end of file
    while (this.not_eof()) {
      program.body.push(this.parse_stmt());
    }

    return program;
  }

  private parse_stmt(): Stmt {
    // skip to parse_expr
    switch (this.at().type) {
      case TokenType.Let:
      case TokenType.Const:
        return this.parse_var_declaration();
      default:
        return this.parse_expr();
    }
  }

  private parse_var_declaration(): Stmt {
    const isConstant = this.eat().type == TokenType.Const;
    const identifier = this.expect(
      TokenType.Identifier,
      "Expected identifier name following let | const keywords."
    ).value;

    if (this.at().type == TokenType.Semicolon) {
      this.eat();
      if (isConstant) {
        throw "Must assign value to constant expression. No value provided.";
      }

      return {
        kind: "VarDeclaration",
        identifier,
        constant: false,
        value: undefined,
      } as VarDeclaration;
    }

    this.expect(
      TokenType.Equals,
      "Expected equals token following identifier in var declaration."
    );

    const declaration = {
      kind: "VarDeclaration",
      value: this.parse_expr(),
      identifier,
      constant: isConstant,
    } as VarDeclaration;

    this.expect(
      TokenType.Semicolon,
      "Variable declaration statement must end with semicolon."
    );

    return declaration;
  }

  private parse_expr(): Expr {
    return this.parse_assignment_expr();
  }

  private parse_assignment_expr(): Expr {
    const left = this.parse_object_expr(); // switch this out with objectExpr

    if (this.at().type == TokenType.Equals) {
      this.eat(); // advance past equals
      const value = this.parse_assignment_expr();

      return { value, assigne: left, kind: "AssignmentExpr" } as AssignmentExpr;
    }

    return left;
  }

  private parse_object_expr(): Expr {
    if (this.at().type !== TokenType.OpenBrace) {
      return this.parse_additive_expr();
    }

    this.eat();
    const properties = new Array<Property>();

    while (this.not_eof() && this.at().type !== TokenType.CloseBrace) {
      const key = this.expect(
        TokenType.Identifier,
        "Object literal key expected"
      ).value;

      // Allows shorthand key: pair -> { key,}
      if (this.at().type == TokenType.Comma) {
        this.eat();
        properties.push({
          key,
          kind: "Property",
          value: undefined,
        } as Property);
        continue;
      } else if (this.at().type == TokenType.CloseBrace) {
        properties.push({
          key,
          kind: "Property",
          value: undefined,
        } as Property);
        continue;
      }

      // {key: val}
      this.expect(
        TokenType.Colon,
        "Missing colon following identifier in ObjectExpr"
      );
      const value = this.parse_expr();

      properties.push({ kind: "Property", value, key });
      if (this.at().type !== TokenType.CloseBrace) {
        this.expect(
          TokenType.Comma,
          "Expected comma or closing bracket following property."
        );
      }
    }

    this.expect(TokenType.CloseBrace, "Object literal missing closing brace.");
    return { kind: "ObjectLiteral", properties } as ObjectLiteral;
  }

  // (10 + 5) - 5
  private parse_additive_expr(): Expr {
    let left = this.parse_multiplicative_expr();

    while (this.at().value == "+" || this.at().value == "-") {
      const operator = this.eat().value;
      const right = this.parse_multiplicative_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  private parse_multiplicative_expr(): Expr {
    let left = this.parse_primary_expr();

    while (
      this.at().value == "/" ||
      this.at().value == "*" ||
      this.at().value == "%"
    ) {
      const operator = this.eat().value;
      const right = this.parse_primary_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  private parse_primary_expr(): Expr {
    const tk = this.at().type;

    switch (tk) {
      case TokenType.Identifier:
        return { kind: "Identifier", symbol: this.eat().value } as Identifier;
      case TokenType.CloseParen:
      case TokenType.Number:
        return {
          kind: "NumericLiteral",
          value: parseFloat(this.eat().value),
        } as NumericLiteral;
      case TokenType.OpenParen: {
        this.eat(); // eat the opening paren
        const value = this.parse_expr();
        this.expect(
          TokenType.CloseParen,
          "Unexpected token found inside parenthesis expression. Expected closing parenthesis."
        ); // closing paren
        return value;
      }
      case TokenType.Equals:
      case TokenType.BinaryOperator:
      case TokenType.Let:
      case TokenType.EOF:
      default:
        console.error("Unexpected token found during parsing!", this.at());
        Deno.exit(1);
    }
  }
}
