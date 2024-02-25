import { assertEquals } from "https://deno.land/std@0.217.0/assert/mod.ts";
import { runLexer } from "../lexer.ts";

Deno.test("Test Lexer Output", async () => {
  // 期待される出力
  const expectedOutput = [
    { value: "let", type: 6 },
    { value: "x", type: 1 },
    { value: "=", type: 2 },
    { value: "45", type: 0 },
  ];

  // 実際の出力を取得
  const actualOutput: any[] = [];
  const originalConsoleLog = console.log; // 元の console.log を保存
  console.log = (output: any) => {
    // モックされた console.log
    actualOutput.push(output);
  };
  await runLexer(); // lexer.ts の実行
  console.log = originalConsoleLog; // 元の console.log を復元

  // 期待される出力と実際の出力を比較
  assertEquals(actualOutput, expectedOutput);
});
