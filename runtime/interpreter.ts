import { NumberVal, RuntimeVal } from "./values.ts";
import {
  BinaryExpr,
  NumericLiteral,
  Program,
  Stmt,
  Identifier,
  VarDeclaration,
  AssignmentExpr,
  ObjectLiteral,
  CallExpr,
  FunctionDeclaration,
} from "./../frontend/ast.ts";
import Environment from "./environment.ts";
import {
  eval_identifier,
  eval_binary_expr,
  eval_assignment,
  eval_object_expr,
  eval_call_expr,
} from "./eval/expressions.ts";
import {
  eval_function_declaration,
  eval_program,
  eval_var_declaration,
} from "./eval/statements.ts";

export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
  switch (astNode.kind) {
    case "NumericLiteral":
      return {
        type: "number",
        value: (astNode as NumericLiteral).value,
      } as NumberVal;

    case "Identifier":
      return eval_identifier(astNode as Identifier, env);

    case "ObjectLiteral":
      return eval_object_expr(astNode as ObjectLiteral, env);

    case "CallExpr":
      return eval_call_expr(astNode as CallExpr, env);

    case "AssignmentExpr":
      return eval_assignment(astNode as AssignmentExpr, env);

    case "BinaryExpr":
      return eval_binary_expr(astNode as BinaryExpr, env);

    case "Program":
      return eval_program(astNode as Program, env);

    case "VarDeclaration":
      return eval_var_declaration(astNode as VarDeclaration, env);

    case "FunctionDeclaration":
      return eval_function_declaration(astNode as FunctionDeclaration, env);

    default:
      console.log(
        "This AST Node has not yet been setup for interpretation\n",
        astNode
      );
      Deno.exit(0);
  }
}
