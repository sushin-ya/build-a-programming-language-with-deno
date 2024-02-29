import { NumberVal } from "./runtime/values.ts";
import Parser from "./frontend/parser.ts";
import Environment from "./runtime/environment.ts";
import { evaluate } from "./runtime/interpreter.ts";

repl();

function repl() {
  const parser = new Parser();
  const env = new Environment();
  env.declareVar("x", { value: 100, type: "number" } as NumberVal);
  console.log("\nRepl v0.1");
  while (true) {
    const input = prompt("> ");
    //Check for no user input or exit keyword.
    if (!input || input.includes("exit")) {
      Deno.exit(1);
    }

    const program = parser.produceAST(input);

    const result = evaluate(program, env);
    console.log(result);
  }
}
