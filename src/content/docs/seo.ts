// Search titles for the docs pages. The page's own title ("Network") is fine in the sidebar
// but too thin for a search result, so each page gets a keyword-bearing title here.
// The root layout appends " | pymlkit".

export const docsSeoTitle: Record<string, string> = {
  introduction: "pymlkit documentation: Python neural networks",
  installation: "Install pymlkit: pip install pymlkit",
  quickstart: "Quickstart: train a neural network in Python",
  network: "Network API reference: add_dense, fit, forward",
  activations: "Activations: ReLU, Sigmoid, Softmax, Linear",
  losses: "Loss functions: HalfMSE and CrossEntropy",
  training: "Training with fit: batching and loss",
  "saving-loading": "Save and load model weights with export and load",
  "custom-loops": "Custom training loops with forward and backward",
  notes: "Notes and limitations of pymlkit",
};

// Meta descriptions (about 120-160 characters) for search results and share cards.
export const docsSeoDescription: Record<string, string> = {
  introduction:
    "What pymlkit is: a small Python neural network library with a C core, no dependencies and an MIT license. Design goals, limits and the roadmap to CNNs and RNNs.",
  installation:
    "Install pymlkit with pip install pymlkit on Windows, macOS or Linux, build it from source with CMake, or load it in the browser with Pyodide and micropip.",
  quickstart:
    "Build, train and run a small neural network in Python with pymlkit: define layers, prepare flat data, call fit and read predictions, using XOR as the example.",
  network:
    "Reference for the pymlkit Network class: Network(), add_dense, set_loss, fit, forward, backward, export and load, with parameters, return values and errors.",
  activations:
    "pymlkit activation functions: ReLU, Sigmoid, Softmax and Linear. Formulas, typical uses and which activation to pick for regression and classification.",
  losses:
    "pymlkit loss functions: HalfMSE for regression and CrossEntropy for classification with Softmax outputs and one-hot targets, with a worked example.",
  training:
    "How to train a pymlkit network: flat data layout, mini-batch SGD, reading the training log, plotting the loss, and tips for learning rate and loss problems.",
  "saving-loading":
    "Save and load pymlkit model weights with export and load: the raw float32 .mlk file format, why the architecture is not checked, and a train-once pattern.",
  "custom-loops":
    "Use pymlkit forward and backward directly for inference loops and experiments, including what the Python wrapper does and does not expose.",
  notes:
    "Limits of pymlkit: CPU only, dense layers only, float32, no shuffling and no architecture check on load. Plus the C-only reinforcement learning agent and license.",
};
