import { writeAllSync } from "https://deno.land/std@0.185.0/streams/mod.ts";
import { Command } from "https://deno.land/x/cliffy@v0.25.7/mod.ts";
import { convert } from "./convert.ts";

await new Command()
  .arguments("<string>")
  .action((_options, filename) => {
    const data = convert(JSON.parse(Deno.readTextFileSync(filename)));
    writeAllSync(
      Deno.stdout,
      new TextEncoder().encode(JSON.stringify(data, undefined, 2)),
    );
  })
  .parse(Deno.args);
