import { processImage } from "./process_image.ts";
import { processText } from "./process_text.ts";

const genIndex = Deno.args.indexOf("--gen");
if (genIndex !== -1) {
  if (Deno.args.length <= genIndex) {
    console.log("You must supply a screenshot to extract from");
    Deno.exit(1);
  }

  const success = await processImage(Deno.args[genIndex + 1]);
  if (!success) {
    console.error("Image extraction failed");
    Deno.exit(1);
  } else {
    Deno.exit(0);
  }
} else {
  const format = Deno.args[0] ?? "md";
  const text = processText(format);
  console.log(text);
}
