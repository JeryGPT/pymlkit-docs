// Single description of the pymlkit Python API. Drives the editor's completions,
// hover docs and signature help. Mirrors python/pymlkit/network.py.

export type Param = {
  name: string;
  /** Default value as written in the signature, if optional. */
  default?: string;
  doc: string;
};

export type Method = {
  name: string;
  params: Param[];
  returns: string;
  summary: string;
  /** Snippet inserted on accept; ${n:...} are tab stops. */
  snippet: string;
};

export type Member = { name: string; doc: string };

export const networkMethods: Method[] = [
  {
    name: "add_dense",
    params: [
      { name: "neuron_count", doc: "Number of neurons, the width of this layer's output." },
      {
        name: "activation",
        default: "Activations.Linear",
        doc: "Non-linearity applied to the layer.",
      },
    ],
    returns: "None",
    summary: "Append a fully connected layer. The last layer you add is the output layer.",
    snippet: "add_dense(${1:16}, Activations.${2|ReLU,Sigmoid,Softmax,Linear|})",
  },
  {
    name: "set_loss",
    params: [{ name: "loss", default: "Losses.HalfMSE", doc: "Loss minimised by fit and backward." }],
    returns: "None",
    summary: "Choose the loss function: HalfMSE (regression, sigmoid) or CrossEntropy (softmax).",
    snippet: "set_loss(Losses.${1|HalfMSE,CrossEntropy|})",
  },
  {
    name: "fit",
    params: [
      { name: "train_x", doc: "All samples concatenated into one flat list of floats." },
      { name: "train_y", doc: "All targets concatenated. Length = samples × output_size." },
      { name: "lr", default: "0.01", doc: "Learning rate." },
      { name: "epochs", default: "10", doc: "Full passes over the data." },
      { name: "batch", default: "1", doc: "Samples per gradient step." },
      { name: "log_step", default: "10", doc: "Loss is printed when epoch % log_step == 0. Use at least 1." },
    ],
    returns: "None",
    summary:
      "Train with mini-batch SGD. Raises ValueError if the data lengths do not match the network shape. Samples are not shuffled between epochs.",
    snippet: "fit(${1:train_x}, ${2:train_y}, lr=${3:0.1}, epochs=${4:100}, batch=${5:16}, log_step=${6:10})",
  },
  {
    name: "forward",
    params: [{ name: "tensor", doc: "One sample: a list of input_size floats." }],
    returns: "list[float]",
    summary: "Run one sample through the network and return output_size floats.",
    snippet: "forward(${1:sample})",
  },
  {
    name: "backward",
    params: [{ name: "label", doc: "Target for the last forward() sample: output_size floats." }],
    returns: "None",
    summary: "Backpropagate one sample, accumulating gradients. Call forward() on the same sample first.",
    snippet: "backward(${1:label})",
  },
  {
    name: "export",
    params: [{ name: "path", default: '"model.mlk"', doc: "Where to write the weights." }],
    returns: "None",
    summary: "Save all weights and biases to a raw float32 file.",
    snippet: 'export("${1:model.mlk}")',
  },
  {
    name: "load",
    params: [{ name: "path", default: '"model.mlk"', doc: "File written by export()." }],
    returns: "bool",
    summary:
      "Load weights. Returns False (and warns) if the file is missing. The architecture is not checked: build the same layers first.",
    snippet: 'load("${1:model.mlk}")',
  },
];

export const networkAttributes: Member[] = [
  { name: "input_size", doc: "Number of inputs per sample, as passed to Network()." },
  { name: "output_size", doc: "Neuron count of the most recently added layer." },
];

export const activations: Member[] = [
  { name: "ReLU", doc: "max(0, x). The usual choice for hidden layers." },
  { name: "Sigmoid", doc: "1 / (1 + e^-x). Single-output binary classification." },
  { name: "Softmax", doc: "e^xᵢ / Σ e^xⱼ. Output layer for multi-class classification." },
  { name: "Linear", doc: "x. Regression outputs. The default." },
];

export const losses: Member[] = [
  { name: "HalfMSE", doc: "½ · (ŷ − y)². Regression and sigmoid outputs. The default." },
  { name: "CrossEntropy", doc: "Classification. Pair with a Softmax output and one-hot targets." },
];

export const networkClass = {
  signature: "Network(input_size)",
  doc: "A multi-layer perceptron with a C core. Add layers with add_dense, pick a loss with set_loss, then fit.",
};

export const exportsList = ["Network", "Activations", "Losses"];

/** `name(a, b=1)` plus the [start, end] offset of each parameter inside it. */
export function signatureOf(m: Method): { label: string; offsets: [number, number][] } {
  let label = `${m.name}(`;
  const offsets: [number, number][] = [];
  m.params.forEach((p, i) => {
    const part = p.default ? `${p.name}=${p.default}` : p.name;
    offsets.push([label.length, label.length + part.length]);
    label += part + (i < m.params.length - 1 ? ", " : "");
  });
  return { label: `${label}) -> ${m.returns}`, offsets };
}
