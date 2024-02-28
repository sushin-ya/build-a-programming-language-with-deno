import { NumberVal, NullVal, RuntimeVal, ValueType } from "./values.ts";
import { NodeType, NumericLiteral, Stmt } from "./../frontend/ast.ts";

export function evaluate(astNode: Stmt): RuntimeVal {
  switch (astNode.kind) {
    case "NumericLiteral":
      return {
        type: "number",
        value: (astNode as NumericLiteral).value,
      } as NumberVal;
    case "NullLiteral":
      return { value: "null", type: "null" } as NullVal;
    default:
      console.log(
        "This AST Node has not yet been setup for interpretation",
        astNode
      );
      Deno.exit(0);
  }
}
