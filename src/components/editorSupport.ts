import type { Monaco } from "@monaco-editor/react";
import type * as monacoTypes from "monaco-editor";
import {
  activations,
  exportsList,
  type Member,
  type Method,
  losses,
  networkAttributes,
  networkClass,
  networkMethods,
  signatureOf,
} from "@/content/api";

// Completions, hover docs and signature help for the pymlkit API in the Try editor.
// Python has no type information here, so a variable counts as a Network when it is
// assigned from Network(...) in the same file (or is named model / net / network).

const NET_ASSIGN = /^\s*([A-Za-z_]\w*)\s*=\s*Network\s*\(/gm;

function networkVars(text: string): Set<string> {
  const names = new Set(["model", "net", "network"]);
  for (const m of text.matchAll(NET_ASSIGN)) names.add(m[1]);
  return names;
}

const md = (value: string): monacoTypes.IMarkdownString => ({ value });
const fence = (code: string) => `${"```"}python\n${code}\n${"```"}`;

function methodDocs(m: Method): monacoTypes.IMarkdownString {
  const params = m.params
    .map((p) => `- \`${p.name}\`${p.default ? ` (default \`${p.default}\`)` : ""}: ${p.doc}`)
    .join("\n");
  return md(`${m.summary}\n\n${params}`);
}

type Call = { obj: string | null; name: string; commas: number; keyword?: string };

/** Find the innermost unclosed call before the cursor, e.g. `model.fit(x, y, lr=`. */
function callAt(textBefore: string): Call | null {
  const text = textBefore.slice(-2000);
  let depth = 0;
  let commas = 0;
  let lastComma = -1;
  for (let i = text.length - 1; i >= 0; i--) {
    const ch = text[i];
    if (ch === ")" || ch === "]" || ch === "}") depth++;
    else if (ch === "(" || ch === "[" || ch === "{") {
      if (depth === 0) {
        if (ch !== "(") return null;
        const head = text.slice(0, i);
        const method = /([A-Za-z_]\w*)\s*\.\s*([A-Za-z_]\w*)\s*$/.exec(head);
        const arg = text.slice(lastComma + 1 || i + 1);
        const keyword = /^\s*([A-Za-z_]\w*)\s*=(?!=)/.exec(arg)?.[1];
        if (method) return { obj: method[1], name: method[2], commas, keyword };
        if (/\bNetwork\s*$/.test(head)) return { obj: null, name: "Network", commas, keyword };
        return null;
      }
      depth--;
    } else if (ch === "," && depth === 0) {
      commas++;
      if (lastComma === -1) lastComma = i;
    }
  }
  return null;
}

let registered = false;

export function registerPymlkit(monaco: Monaco) {
  if (registered) return;
  registered = true;

  const K = monaco.languages.CompletionItemKind;
  const SNIPPET = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;

  const members = (list: Member[], owner: string, range: monacoTypes.IRange) =>
    list.map((m, i) => ({
      label: m.name,
      kind: K.EnumMember,
      detail: `${owner}.${m.name}`,
      documentation: md(m.doc),
      insertText: m.name,
      sortText: `0${i}`,
      range,
    }));

  monaco.languages.registerCompletionItemProvider("python", {
    triggerCharacters: ["."],
    provideCompletionItems(model, pos) {
      const line = model.getLineContent(pos.lineNumber).slice(0, pos.column - 1);
      const word = model.getWordUntilPosition(pos);
      const range = {
        startLineNumber: pos.lineNumber,
        endLineNumber: pos.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      if (/^\s*from\s+pymlkit\s+import\s+[\w,\s]*$/.test(line)) {
        return {
          suggestions: exportsList.map((name, i) => ({
            label: name,
            kind: K.Class,
            insertText: name,
            sortText: `0${i}`,
            range,
          })),
        };
      }

      const dot = /([A-Za-z_]\w*)\.\w*$/.exec(line);
      if (dot) {
        const owner = dot[1];
        if (owner === "Activations") return { suggestions: members(activations, owner, range) };
        if (owner === "Losses") return { suggestions: members(losses, owner, range) };
        if (networkVars(model.getValue()).has(owner)) {
          return {
            suggestions: [
              ...networkMethods.map((m, i) => ({
                label: m.name,
                kind: K.Method,
                detail: signatureOf(m).label,
                documentation: methodDocs(m),
                insertText: m.snippet,
                insertTextRules: SNIPPET,
                sortText: `0${i}`,
                range,
              })),
              ...networkAttributes.map((a, i) => ({
                label: a.name,
                kind: K.Property,
                detail: `Network.${a.name}`,
                documentation: md(a.doc),
                insertText: a.name,
                sortText: `1${i}`,
                range,
              })),
            ],
          };
        }
        return { suggestions: [] };
      }

      return {
        suggestions: [
          {
            label: "Network",
            kind: K.Class,
            detail: networkClass.signature,
            documentation: md(networkClass.doc),
            insertText: "Network(${1:2})",
            insertTextRules: SNIPPET,
            sortText: "00",
            range,
          },
          {
            label: "Activations",
            kind: K.Enum,
            detail: "enum",
            documentation: md(activations.map((a) => `- \`${a.name}\`: ${a.doc}`).join("\n")),
            insertText: "Activations",
            sortText: "01",
            range,
          },
          {
            label: "Losses",
            kind: K.Enum,
            detail: "enum",
            documentation: md(losses.map((l) => `- \`${l.name}\`: ${l.doc}`).join("\n")),
            insertText: "Losses",
            sortText: "02",
            range,
          },
          {
            label: "pymlkit model",
            kind: K.Snippet,
            detail: "snippet",
            documentation: md("A small network with a loss, ready to fit."),
            insertText: [
              "model = Network(${1:2})",
              "model.add_dense(${2:16}, Activations.ReLU)",
              "model.add_dense(${3:1}, Activations.Sigmoid)",
              "model.set_loss(Losses.${4|HalfMSE,CrossEntropy|})",
              "$0",
            ].join("\n"),
            insertTextRules: SNIPPET,
            sortText: "03",
            range,
          },
        ],
      };
    },
  });

  monaco.languages.registerSignatureHelpProvider("python", {
    signatureHelpTriggerCharacters: ["(", ","],
    provideSignatureHelp(model, pos) {
      const before = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: pos.lineNumber,
        endColumn: pos.column,
      });
      const call = callAt(before);
      if (!call) return null;

      if (call.name === "Network" && call.obj === null) {
        return {
          value: {
            signatures: [
              {
                label: networkClass.signature,
                documentation: md(networkClass.doc),
                parameters: [
                  {
                    label: [8, 18] as [number, number],
                    documentation: md("Number of inputs per sample."),
                  },
                ],
              },
            ],
            activeSignature: 0,
            activeParameter: 0,
          },
          dispose() {},
        };
      }

      const method = networkMethods.find((m) => m.name === call.name);
      if (!method || !call.obj || !networkVars(model.getValue()).has(call.obj)) return null;

      const { label, offsets } = signatureOf(method);
      const byName = call.keyword ? method.params.findIndex((p) => p.name === call.keyword) : -1;
      const active = byName >= 0 ? byName : Math.min(call.commas, method.params.length - 1);
      return {
        value: {
          signatures: [
            {
              label,
              documentation: md(method.summary),
              parameters: method.params.map((p, i) => ({
                label: offsets[i],
                documentation: md(`**${p.name}**: ${p.doc}`),
              })),
            },
          ],
          activeSignature: 0,
          activeParameter: active,
        },
        dispose() {},
      };
    },
  });

  monaco.languages.registerHoverProvider("python", {
    provideHover(model, pos) {
      const w = model.getWordAtPosition(pos);
      if (!w) return null;
      const range = {
        startLineNumber: pos.lineNumber,
        endLineNumber: pos.lineNumber,
        startColumn: w.startColumn,
        endColumn: w.endColumn,
      };
      const before = model.getLineContent(pos.lineNumber).slice(0, w.startColumn - 1);
      const owner = /([A-Za-z_]\w*)\s*\.\s*$/.exec(before)?.[1];

      if (owner === "Activations" || owner === "Losses") {
        const m = (owner === "Activations" ? activations : losses).find((x) => x.name === w.word);
        return m ? { range, contents: [md(fence(`${owner}.${m.name}`)), md(m.doc)] } : null;
      }
      if (owner && networkVars(model.getValue()).has(owner)) {
        const m = networkMethods.find((x) => x.name === w.word);
        if (m) return { range, contents: [md(fence(signatureOf(m).label)), methodDocs(m)] };
        const a = networkAttributes.find((x) => x.name === w.word);
        if (a) return { range, contents: [md(fence(`Network.${a.name}`)), md(a.doc)] };
        return null;
      }
      if (!owner) {
        if (w.word === "Network")
          return { range, contents: [md(fence(networkClass.signature)), md(networkClass.doc)] };
        if (w.word === "Activations")
          return {
            range,
            contents: [md(fence("class Activations(Enum)")), md(activations.map((a) => `- \`${a.name}\`: ${a.doc}`).join("\n"))],
          };
        if (w.word === "Losses")
          return {
            range,
            contents: [md(fence("class Losses(Enum)")), md(losses.map((l) => `- \`${l.name}\`: ${l.doc}`).join("\n"))],
          };
      }
      return null;
    },
  });
}
