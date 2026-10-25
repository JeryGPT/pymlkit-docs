export type Example = { id: string; label: string; code: string };

export const examples: Example[] = [
  {
    id: "xor",
    label: "XOR",
    code: `from pymlkit import Network, Activations, Losses

model = Network(2)
model.add_dense(8, Activations.ReLU)
model.add_dense(1, Activations.Sigmoid)
model.set_loss(Losses.HalfMSE)

x = [0, 0,  0, 1,  1, 0,  1, 1]
y = [0,     1,     1,     0]

model.fit(x * 50, y * 50, lr=0.5, epochs=300, batch=4, log_step=100)

for i in range(4):
    sample = x[i * 2 : i * 2 + 2]
    print(sample, "->", round(model.forward(sample)[0], 3))
`,
  },
  {
    id: "circle",
    label: "Circle",
    code: `from random import random
from pymlkit import Network, Activations, Losses

# Learn whether a point lies inside the unit circle.
model = Network(2)
model.add_dense(16, Activations.ReLU)
model.add_dense(8, Activations.ReLU)
model.add_dense(1, Activations.Sigmoid)
model.set_loss(Losses.HalfMSE)

xs, ys = [], []
for _ in range(4000):
    px, py = random() * 2 - 1, random() * 2 - 1
    xs += [px, py]
    ys.append(float(px * px + py * py < 1))

model.fit(xs, ys, lr=0.1, epochs=60, batch=16, log_step=20)

SIZE = 24
for gy in range(SIZE):
    row = ""
    for gx in range(SIZE):
        px = gx / (SIZE - 1) * 2 - 1
        py = gy / (SIZE - 1) * 2 - 1
        row += "██" if model.forward([px, py])[0] > 0.5 else "  "
    print(row)
`,
  },
  {
    id: "mnist",
    label: "MNIST",
    code: `import gzip
from pyodide.http import pyfetch
from pymlkit import Network, Activations, Losses

async def fetch(name):
    r = await pyfetch(f"/mnist/{name}.gz")
    return gzip.decompress(await r.bytes())

print("downloading MNIST (60,000 train / 10,000 test)...")
train_img, train_lab = await fetch("train-images"), await fetch("train-labels")
test_img, test_lab = await fetch("test-images"), await fetch("test-labels")

# pymlkit takes flat lists. A lookup table keeps 47M pixels from becoming 47M float objects.
print("building tensors...")
lut = [i / 255 for i in range(256)]
train_x = [lut[p] for p in train_img]
train_y = []
for digit in train_lab:
    train_y += [1.0 if digit == k else 0.0 for k in range(10)]

model = Network(784)
model.add_dense(64, Activations.ReLU)
model.add_dense(10, Activations.Softmax)
model.set_loss(Losses.CrossEntropy)

print("training...")
model.fit(train_x, train_y, lr=0.05, epochs=5, batch=16, log_step=1)

def predict(i):
    out = model.forward([lut[p] for p in test_img[i * 784 : (i + 1) * 784]])
    return out.index(max(out))

hits = sum(predict(i) == test_lab[i] for i in range(10000))
print(f"test accuracy: {hits / 10000:.2%}")

# look at a few digits
for i in range(3):
    for row in range(0, 28, 2):
        px = test_img[i * 784 + row * 28 : i * 784 + row * 28 + 28]
        print("".join(" .:+#@"[min(5, p // 43)] for p in px))
    print(f"-> model says {predict(i)} (label {test_lab[i]})\\n")
`,
  },
  {
    id: "save",
    label: "Save / load",
    code: `from pymlkit import Network, Activations, Losses

def build():
    m = Network(2)
    m.add_dense(8, Activations.ReLU)
    m.add_dense(1, Activations.Sigmoid)
    m.set_loss(Losses.HalfMSE)
    return m

x = [0, 0,  0, 1,  1, 0,  1, 1]
y = [0, 1, 1, 0]

trained = build()
trained.fit(x * 50, y * 50, lr=0.5, epochs=200, batch=4, log_step=100)
trained.export("model.mlk")           # lives in the in-browser filesystem

restored = build()                    # same architecture, fresh weights
print("loaded:", restored.load("model.mlk"))

for i in range(4):
    s = x[i * 2 : i * 2 + 2]
    print(s, round(trained.forward(s)[0], 3), "==", round(restored.forward(s)[0], 3))
`,
  },
];

export const starter = `from pymlkit import Network, Activations, Losses

model = Network(2)
model.add_dense(8, Activations.ReLU)
model.add_dense(1, Activations.Sigmoid)
model.set_loss(Losses.HalfMSE)

# flat lists: [x1a, x1b, x2a, x2b, ...] and [y1, y2, ...]
x = []
y = []

# model.fit(x, y, lr=0.1, epochs=100, batch=16, log_step=50)
# print(model.forward([0, 0]))
`;
