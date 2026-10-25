import Link from "next/link";
import type { ReactNode } from "react";
import { Code } from "@/components/Code";
import { Callout, H2, Params, Sig } from "@/components/Prose";

export type DocPage = {
  slug: string;
  title: string;
  group: string;
  description: string;
  body: () => ReactNode;
};

export const pages: DocPage[] = [
  {
    slug: "introduction",
    title: "Introduction",
    group: "Getting started",
    description: "What pymlkit is, and what it deliberately is not.",
    body: () => (
      <>
        <p>
          pymlkit is a small multi-layer perceptron library. The numerical work, forward pass,
          backpropagation and mini-batch SGD, is written in C. Python only marshals your lists into
          C arrays through <code>ctypes</code>.
        </p>
        <H2>Design goals</H2>
        <ul>
          <li>
            <b>Small.</b> One class, seven methods. The entire Python wrapper is a few dozen lines.
          </li>
          <li>
            <b>Dependency-free.</b> No NumPy. Inputs and outputs are plain Python lists of floats.
          </li>
          <li>
            <b>Fast enough.</b> Training loops run in compiled C with <code>-Ofast</code>.
          </li>
          <li>
            <b>Portable.</b> Wheels exist for Windows, macOS, Linux, and WebAssembly (Pyodide).
          </li>
        </ul>
        <H2>What it is not</H2>
        <p>
          pymlkit supports dense feed-forward networks trained on the CPU. There are no
          convolutions, no GPU support and no automatic differentiation. It is a library for
          learning, prototyping and small problems, not production-hardened. That is where it is
          today, not where it is headed.
        </p>
        <Callout>
          Want to see it work first? Open the <Link href="/try/">playground</Link>. It installs
          pymlkit from PyPI into your browser.
        </Callout>
        <H2>Where it is going</H2>
        <p>
          pymlkit is young and I plan to keep improving it. The goal is an easy-as-hell machine
          learning library: the least possible code between an idea and a trained model, without
          hiding how any of it works. Planned next:
        </p>
        <ul>
          <li>
            <b>Convolutional networks (CNN)</b> for images.
          </li>
          <li>
            <b>Recurrent networks (RNN)</b> for sequences.
          </li>
          <li>
            <b>Transformers</b>, further down the road.
          </li>
        </ul>
        <Callout>
          These are plans, not features you can use today, and none of them has a date. The dense
          network API documented here is what ships now.
        </Callout>
        <H2>Next steps</H2>
        <ul>
          <li>
            <Link href="/docs/installation/">Install it</Link>
          </li>
          <li>
            <Link href="/docs/quickstart/">Train your first network</Link>
          </li>
          <li>
            <Link href="/docs/network/">Read the API reference</Link>
          </li>
        </ul>
      </>
    ),
  },
  {
    slug: "installation",
    title: "Installation",
    group: "Getting started",
    description: "Install from PyPI, from source, or inside Pyodide.",
    body: () => (
      <>
        <H2>From PyPI</H2>
        <Code lang="bash" code="pip install pymlkit" />
        <p>
          Prebuilt wheels cover Windows (32 and 64 bit), macOS (Intel and Apple Silicon) and Linux
          x86-64. Requires Python 3.9 or newer. The wheels are tagged <code>py3</code>, so one wheel
          per platform works on every supported Python version.
        </p>
        <H2>From source</H2>
        <p>
          The build uses <code>scikit-build-core</code> and CMake, so you need a C compiler.
        </p>
        <Code
          lang="bash"
          code={`
git clone https://github.com/JeryGPT/Multi-Layer-Perceptron-Kit
cd Multi-Layer-Perceptron-Kit
pip install .
`}
        />
        <H2>In the browser (Pyodide)</H2>
        <p>
          PyPI also hosts a WebAssembly wheel, so Pyodide can install it with <code>micropip</code>:
        </p>
        <Code
          code={`
import micropip
await micropip.install("pymlkit")

from pymlkit import Network
`}
        />
        <p>
          Try exactly this on the <Link href="/try/">playground</Link>.
        </p>
        <H2>Verify</H2>
        <Code
          code={`
import pymlkit
print(pymlkit.__version__)   # 0.1.1
`}
        />
        <Callout tone="warn">
          If you see <code>ImportError: Native library not found</code>, pip selected a source
          install without a compiled library. Reinstall with a compiler available, or use a
          supported prebuilt platform.
        </Callout>
      </>
    ),
  },
  {
    slug: "quickstart",
    title: "Quickstart",
    group: "Getting started",
    description: "Train a small network on XOR and read its predictions.",
    body: () => (
      <>
        <p>XOR is the classic problem a single neuron cannot solve, and a small network can.</p>
        <H2>1. Describe the network</H2>
        <Code
          code={`
from pymlkit import Network, Activations, Losses

model = Network(2)                          # two inputs
model.add_dense(8, Activations.ReLU)        # hidden layer
model.add_dense(1, Activations.Sigmoid)     # output layer, last
model.set_loss(Losses.HalfMSE)
`}
        />
        <p>
          The output layer is whichever one you add <em>last</em>. There is no separate output
          declaration.
        </p>
        <H2>2. Prepare flat data</H2>
        <p>
          Samples are concatenated into one flat list. Four samples with two inputs each become
          eight numbers.
        </p>
        <Code
          code={`
x = [0, 0,   0, 1,   1, 0,   1, 1]
y = [0,      1,      1,      0]
`}
        />
        <H2>3. Fit</H2>
        <Code code={`model.fit(x * 50, y * 50, lr=0.5, epochs=300, batch=4, log_step=100)`} />
        <p>
          Repeating the four samples gives the optimizer more steps per epoch. Training prints
          progress and a loss value every <code>log_step</code> epochs.
        </p>
        <H2>4. Predict</H2>
        <Code
          code={`
for i in range(4):
    sample = x[i * 2 : i * 2 + 2]
    print(sample, "->", round(model.forward(sample)[0], 2))

# [0, 0] -> 0.02
# [0, 1] -> 0.99
# [1, 0] -> 0.99
# [1, 1] -> 0.01
`}
        />
        <Callout>
          Exact numbers vary between runs because weights are initialised randomly.
        </Callout>
      </>
    ),
  },
  {
    slug: "network",
    title: "Network",
    group: "API reference",
    description: "The Network class and all of its methods.",
    body: () => (
      <>
        <p>
          <code>Network</code> owns a C network struct and frees it when the Python object is
          garbage collected. Every operation is a method on it.
        </p>
        <Code code="from pymlkit import Network" />

        <H2>Network()</H2>
        <Sig>Network(input_size: int)</Sig>
        <p>
          Creates an empty network that accepts <code>input_size</code> numbers per sample. Add
          layers with <code>add_dense</code> before training.
        </p>
        <p>
          Attributes: <code>input_size</code> and <code>output_size</code>. The latter is the
          neuron count of the most recently added layer, and starts at 1.
        </p>

        <H2>add_dense</H2>
        <Sig>add_dense(neuron_count: int, activation: Activations = Activations.Linear)</Sig>
        <p>Appends a fully connected layer. Layers are applied in the order they are added.</p>
        <Params
          rows={[
            ["neuron_count", "int", "Number of neurons, which is the width of this layer's output."],
            ["activation", "Activations", "Non-linearity applied to the layer. Defaults to Linear."],
          ]}
        />

        <H2>set_loss</H2>
        <Sig>set_loss(loss: Losses = Losses.HalfMSE)</Sig>
        <p>
          Selects the loss minimised by <code>fit</code> and <code>backward</code>. See{" "}
          <Link href="/docs/losses/">Losses</Link>.
        </p>

        <H2>fit</H2>
        <Sig>fit(train_x, train_y, lr=0.01, epochs=10, batch=1, log_step=10)</Sig>
        <p>Trains with mini-batch stochastic gradient descent. Returns nothing.</p>
        <Params
          rows={[
            ["train_x", "list[float]", "All samples concatenated. Length must be a multiple of input_size."],
            ["train_y", "list[float]", "All targets concatenated. Length must equal samples × output_size."],
            ["lr", "float", "Learning rate."],
            ["epochs", "int", "Full passes over the data."],
            ["batch", "int", "Samples per gradient step."],
            ["log_step", "int", "Loss is printed when epoch % log_step == 0. Must be at least 1."],
          ]}
        />
        <p>
          Raises <code>ValueError</code> when the data lengths do not match the network shape. See{" "}
          <Link href="/docs/training/">Training</Link> for details.
        </p>

        <H2>forward</H2>
        <Sig>forward(tensor: list[float]) -&gt; list[float]</Sig>
        <p>
          Runs one sample through the network and returns a new list with <code>output_size</code>{" "}
          floats. Raises <code>ValueError</code> if <code>len(tensor) != input_size</code>.
        </p>
        <Code
          code={`
model.forward([0.1, 0.2])   # [0.93]
`}
        />

        <H2>backward</H2>
        <Sig>backward(label: list[float]) -&gt; None</Sig>
        <p>
          Backpropagates one sample, accumulating gradients. Call <code>forward</code> on the same
          sample first. Raises <code>ValueError</code> if <code>len(label) != output_size</code>.
          See <Link href="/docs/custom-loops/">Custom loops</Link>.
        </p>

        <H2>export</H2>
        <Sig>export(path: str = "model.mlk") -&gt; None</Sig>
        <p>Writes all weights and biases to a binary file.</p>

        <H2>load</H2>
        <Sig>load(path: str = "model.mlk") -&gt; bool</Sig>
        <p>
          Reads weights from a file written by <code>export</code>. Returns <code>False</code> and
          prints a warning if the file does not exist, otherwise <code>True</code>. See{" "}
          <Link href="/docs/saving-loading/">Saving and loading</Link>.
        </p>
      </>
    ),
  },
  {
    slug: "activations",
    title: "Activations",
    group: "API reference",
    description: "The four activation functions.",
    body: () => (
      <>
        <p>
          <code>Activations</code> is an enum passed to <code>add_dense</code>.
        </p>
        <Code code="from pymlkit import Activations" />
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Formula</th>
              <th>Typical use</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>ReLU</code>
              </td>
              <td className="font-mono text-xs">max(0, x)</td>
              <td>Hidden layers.</td>
            </tr>
            <tr>
              <td>
                <code>Sigmoid</code>
              </td>
              <td className="font-mono text-xs">1 / (1 + e^-x)</td>
              <td>Single-output binary classification.</td>
            </tr>
            <tr>
              <td>
                <code>Softmax</code>
              </td>
              <td className="font-mono text-xs">e^xᵢ / Σ e^xⱼ</td>
              <td>Output layer for multi-class classification.</td>
            </tr>
            <tr>
              <td>
                <code>Linear</code>
              </td>
              <td className="font-mono text-xs">x</td>
              <td>Regression outputs. The default.</td>
            </tr>
          </tbody>
        </table>
        <Callout>
          The enum also has a <code>NONE</code> member. It exists for parity with the C library and
          is not meant for normal use.
        </Callout>
        <H2>Choosing one</H2>
        <ul>
          <li>Regression: hidden ReLU, output Linear, loss HalfMSE.</li>
          <li>Binary classification: hidden ReLU, output Sigmoid, loss HalfMSE or CrossEntropy.</li>
          <li>Multi-class: hidden ReLU, output Softmax, loss CrossEntropy.</li>
        </ul>
      </>
    ),
  },
  {
    slug: "losses",
    title: "Losses",
    group: "API reference",
    description: "HalfMSE and CrossEntropy.",
    body: () => (
      <>
        <p>
          <code>Losses</code> is an enum passed to <code>set_loss</code>.
        </p>
        <Code code="from pymlkit import Losses" />
        <H2>HalfMSE</H2>
        <p>
          Half the mean squared error, <code>½ · (ŷ − y)²</code>. The ½ cancels the 2 in the
          derivative. This is the default and suits regression and sigmoid outputs.
        </p>
        <H2>CrossEntropy</H2>
        <p>
          Cross-entropy for classification. Pair it with a <code>Softmax</code> output layer and
          one-hot targets.
        </p>
        <Code
          code={`
model = Network(4)
model.add_dense(16, Activations.ReLU)
model.add_dense(3, Activations.Softmax)
model.set_loss(Losses.CrossEntropy)

# three classes -> one-hot targets, flattened
train_y = [1, 0, 0,   0, 1, 0,   0, 0, 1]
`}
        />
      </>
    ),
  },
  {
    slug: "training",
    title: "Training",
    group: "Guides",
    description: "Data layout, batching and reading the training log.",
    body: () => (
      <>
        <H2>Data layout</H2>
        <p>
          Both <code>train_x</code> and <code>train_y</code> are flat lists. For a network with 2
          inputs and 3 outputs and N samples, <code>train_x</code> has 2N numbers and{" "}
          <code>train_y</code> has 3N.
        </p>
        <Code
          code={`
# samples: (a1, a2), (b1, b2)
train_x = [a1, a2,  b1, b2]
`}
        />
        <p>
          If the lengths do not fit, <code>fit</code> raises a <code>ValueError</code> that states
          the expected length.
        </p>
        <H2>Batching</H2>
        <p>
          <code>batch</code> samples are processed, their gradients accumulated, then the weights
          are updated once with the gradient averaged over the batch. <code>batch=1</code> is
          plain SGD. Larger batches give smoother but fewer updates per epoch.
        </p>
        <Callout tone="warn">
          Samples are visited in order and not shuffled between epochs. If your data is sorted by
          class, shuffle it before calling <code>fit</code>.
        </Callout>
        <H2>The training log</H2>
        <p>
          <code>fit</code> prints a progress bar for every epoch, and a loss line whenever{" "}
          <code>epoch % log_step == 0</code>. Use a larger <code>log_step</code> for quieter
          output. Do not pass 0, which would divide by zero in the C library.
        </p>
        <H2>Plotting the loss</H2>
        <p>
          The Python wrapper does not return the loss. <code>fit</code> only prints it. To plot a
          loss curve in your own code, train one epoch at a time and measure it yourself:
        </p>
        <Code
          code={`
import matplotlib.pyplot as plt

history = []
for _ in range(60):
    model.fit(x, y, lr=0.1, epochs=1, batch=16, log_step=1)
    err = sum((model.forward(x[i*2:i*2+2])[0] - y[i]) ** 2 for i in range(len(y)))
    history.append(err / len(y))

plt.plot(history)
plt.show()
`}
        />
        <Callout>
          On the <Link href="/try/">playground</Link>, Matplotlib works out of the box and figures
          appear under the output.
        </Callout>
        <H2>Tuning tips</H2>
        <ul>
          <li>If the loss turns to NaN, lower <code>lr</code>.</li>
          <li>If it plateaus high, add neurons or another hidden layer.</li>
          <li>Inputs scaled to roughly −1 to 1 train noticeably faster.</li>
          <li>Values are stored as 32-bit floats, so expect float32 precision.</li>
        </ul>
      </>
    ),
  },
  {
    slug: "saving-loading",
    title: "Saving and loading",
    group: "Guides",
    description: "Persist trained weights with export and load.",
    body: () => (
      <>
        <Code
          code={`
model.export("model.mlk")

fresh = Network(2)
fresh.add_dense(8, Activations.ReLU)
fresh.add_dense(1, Activations.Sigmoid)
ok = fresh.load("model.mlk")      # True
`}
        />
        <H2>File format</H2>
        <p>
          A <code>.mlk</code> file is a raw stream of 32-bit floats: for every neuron, its bias,
          then its weights, layer by layer. There is no header.
        </p>
        <Callout tone="warn">
          Because there is no header, <code>load</code> cannot check that the architecture matches.
          Build the network with the same layers, in the same order, before loading.
        </Callout>
        <H2>Train once, reuse</H2>
        <p>A common pattern is to train only when no saved model exists:</p>
        <Code
          code={`
if not model.load("model.mlk"):
    model.fit(x, y, lr=0.1, epochs=100, batch=16)
    model.export("model.mlk")
`}
        />
      </>
    ),
  },
  {
    slug: "custom-loops",
    title: "Custom loops",
    group: "Guides",
    description: "Using forward and backward directly.",
    body: () => (
      <>
        <p>
          <code>fit</code> covers most needs, but <code>forward</code> and <code>backward</code> are
          exposed for inspection and experiments.
        </p>
        <Code
          code={`
out = model.forward(sample)        # populate activations
model.backward(target)             # accumulate gradients for this sample
`}
        />
        <Callout tone="warn">
          The C library has <code>nn_apply_gradients</code> to apply accumulated gradients, but the
          Python wrapper does not expose it yet. From Python, use <code>fit</code> to update
          weights. Applying gradients manually is available from the C API.
        </Callout>
        <H2>Inference loops</H2>
        <p>
          <code>forward</code> is the right tool for evaluation, for example scoring a grid of
          points to visualise a decision boundary:
        </p>
        <Code
          code={`
SIZE = 20
for gy in range(SIZE):
    row = ""
    for gx in range(SIZE):
        px = gx / (SIZE - 1) * 2 - 1
        py = gy / (SIZE - 1) * 2 - 1
        row += "██" if model.forward([px, py])[0] > 0.5 else "  "
    print(row)
`}
        />
      </>
    ),
  },
  {
    slug: "notes",
    title: "Notes and limits",
    group: "Guides",
    description: "Things worth knowing before you depend on it.",
    body: () => (
      <>
        <ul>
          <li>
            <b>CPU only.</b> No GPU support.
          </li>
          <li>
            <b>Dense layers only.</b> No convolutional or recurrent layers.
          </li>
          <li>
            <b>float32 everywhere.</b> Python floats are converted on the way in and out.
          </li>
          <li>
            <b>No shuffling</b> between epochs.
          </li>
          <li>
            <b>No architecture check</b> when loading weights.
          </li>
          <li>
            <b>Output size tracking</b> follows the last <code>add_dense</code> call.
          </li>
        </ul>
        <H2>Reinforcement learning</H2>
        <p>
          The C library also ships a REINFORCE agent (<code>rl_agent_create</code>,{" "}
          <code>rl_draw_action</code>, <code>rl_remember</code>, <code>rl_policy_fit</code>). It is
          not wrapped in Python. See the Snake example in the{" "}
          <a href="https://github.com/JeryGPT/Multi-Layer-Perceptron-Kit">repository</a>.
        </p>
        <H2>License</H2>
        <p>MIT.</p>
      </>
    ),
  },
];

export const groups = Array.from(new Set(pages.map((p) => p.group)));
