/* =========================
   IDEA EVALUATION MODEL
========================= */
const IDEA_MODEL = {
    title: "Генератор та оцінка ідей",
    criteria: {
        innovation: {
            label: "Новизна",
            hint: "Рівень новизни ідеї",
            weight: 0.25,
            min: 0,
            max: 10
        },
        feasibility: {
            label: "Доцільність",
            hint: "Наскільки реально впровадити",
            weight: 0.2,
            min: 0,
            max: 10
        },
        value: {
            label: "Створення цінності",
            hint: "Здатність ідеї формувати економічну, соціальну та сп",
            weight: 0.25,
            min: 0,
            max: 10
        },
        value: {
            label: "Орієнтація на користувача",
            hint: "Користь для користувача або бізнесу",
            weight: 0.2,
            min: 0,
            max: 10
        },
        value: {
            label: "Масштабованість",
            hint: "Потенціал ідеї до розширення, тиражування та адаптації в інших контекстах",
            weight: 0.1,
            min: 0,
            max: 10
        },
    }

};
/* =========================
   CURRENT (USER-EDITABLE) WEIGHTS
========================= */
let currentWeights = { ...DEFAULT_WEIGHTS };

/* =========================
   UPDATE WEIGHTS FUNCTION
========================= */
function updateWeights(newWeights) {
    const total = Object.values(newWeights).reduce((sum, w) => sum + w, 0);

    if (total === 0) {
        console.warn("Сума ваг не може дорівнювати 0");
        return;
    }

    // Нормалізація (щоб сума = 1)
    Object.keys(newWeights).forEach(key => {
        if (currentWeights.hasOwnProperty(key)) {
            currentWeights[key] = newWeights[key] / total;
        }
    });
}

/* =========================
   CALCULATE IDEA INDEX
========================= */
function calculateIdeaIndex(idea) {
    return Object.keys(currentWeights).reduce((sum, key) => {
        return sum + (idea[key] * currentWeights[key]);
    }, 0);
}

/* =========================
   RESET TO DEFAULT
========================= */
function resetWeights() {
    currentWeights = { ...DEFAULT_WEIGHTS };
}

/* =========================
   STATE
========================= */
const app = document.getElementById("app");
let ideas = [];

/* =========================
   HELPERS
========================= */
const calculateIndex = (idea) =>
    Object.keys(IDEA_MODEL.criteria).reduce(
        (sum, key) =>
            sum + idea[key] * IDEA_MODEL.criteria[key].weight,
        0
    );

const clearInputs = () => {
    document.getElementById("ideaName").value = "";
    Object.keys(IDEA_MODEL.criteria).forEach(
        (key) => (document.getElementById(key).value = "")
    );
};

const removeIdea = (index) => {
    ideas.splice(index, 1);
    renderIdeas();
    document.getElementById("bestIdea").innerHTML = "";
};

const renderIdeas = () => {
    const list = document.getElementById("ideaList");

    if (!ideas.length) {
        list.innerHTML = `<p style="opacity:.6">Ідеї ще не додані</p>`;
        return;
    }

    list.innerHTML = ideas
        .map(
            (idea, i) => `
      <div class="idea">
        <div>
          <strong>${idea.name}</strong><br/>
          <small>
            ${
                idea.index !== null
                    ? `Індекс: ${idea.index.toFixed(2)}`
                    : "Індекс ще не розраховано"
            }
          </small>
        </div>
        <button onclick="removeIdea(${i})">✕</button>
      </div>
    `
        )
        .join("");
};

/* =========================
   UI GENERATION
========================= */
const criteriaInputs = Object.entries(IDEA_MODEL.criteria)
    .map(
        ([key, c]) => `
    <label>
      ${c.label} (${c.min}–${c.max})
      <input
        id="${key}"
        type="number"
        min="${c.min}"
        max="${c.max}"
        placeholder="${c.hint}"
      />
    </label>
  `
    )
    .join("");

app.innerHTML = `
  <div class="card">
    <h2>${IDEA_MODEL.title}</h2>

    <label>
      Назва ідеї
      <input id="ideaName" placeholder="Наприклад: Smart City Platform" />
    </label>

    ${criteriaInputs}

    <button id="addIdea">➕ Додати ідею</button>
    <button id="calculate">📊 Розрахувати індекси</button>

    <div id="ideaList"></div>
    <div id="bestIdea"></div>
  </div>
`;

/* =========================
   EVENTS
========================= */
document.getElementById("addIdea").onclick = () => {
    const idea = {
        name: document.getElementById("ideaName").value.trim(),
        index: null
    };

    for (const key in IDEA_MODEL.criteria) {
        const { min, max } = IDEA_MODEL.criteria[key];
        const value = +document.getElementById(key).value;

        if (isNaN(value) || value < min || value > max) {
            alert(`Перевірте значення: ${IDEA_MODEL.criteria[key].label}`);
            return;
        }

        idea[key] = value;
    }

    if (!idea.name) {
        alert("Вкажіть назву ідеї");
        return;
    }

    ideas.push(idea);
    clearInputs();
    renderIdeas();
};

document.getElementById("calculate").onclick = () => {
    if (!ideas.length) return;

    ideas = ideas.map((idea) => ({
        ...idea,
        index: calculateIndex(idea)
    }));

    const best = ideas.reduce((a, b) =>
        a.index > b.index ? a : b
    );

    renderIdeas();

    document.getElementById("bestIdea").innerHTML = `
    <div class="idea" style="margin-top:20px; border-left:4px solid #22d3ee">
      🏆 <strong>Найкраща ідея:</strong> ${best.name}<br/>
      <small>Інтегральний індекс: ${best.index.toFixed(2)}</small>
    </div>
  `;
};
