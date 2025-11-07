// personelTakip - JavaScript Dosyası
// Versiyon 1.0

const STORAGE_KEY = "personelTakipData_v1";
const SELECTED_TEAM_KEY = "personelTakipSelectedTeam_v1";

// Varsayılan (global) maksimum satır -> yeni sütuna geçiş değeri.
// Artık her ekip için kullanıcı panelinden değiştirilebilir olacak.
const DEFAULT_MAX_ROWS_PER_COLUMN = 16;
const BASE_CARD_WIDTH = 460;
const COLUMN_PAIR_WIDTH = 230;

const TEAM_CONFIG = [
    { key: "dis", title: "DIŞ EKİP", subtitle: "Eylül Prim Tablosu" },
    { key: "paf", title: "PAF EKİP", subtitle: "Eylül Prim Tablosu" },
    { key: "vip", title: "V.İ.P AS EKİP", subtitle: "Eylül Prim Tablosu" },
    { key: "hos", title: "HOŞGELDİN EKİBİ", subtitle: "Eylül Prim Tablosu" },
    { key: "donusum", title: "DÖNÜŞÜM EKİBİ", subtitle: "Eylül Prim Tablosu" },
    { key: "yatirimli", title: "YATIRIMLI PASİF EKİBİ", subtitle: "Eylül Prim Tablosu" },
    { key: "retention", title: "RETANTION EKİBİ", subtitle: "Eylül Prim Tablosu" },
];

const emptyState = TEAM_CONFIG.reduce((acc, t) => { acc[t.key] = { entries: [] }; return acc; }, {});

// Her ekip için kullanıcı tarafından belirlenebilecek 'satırdan sonra böl' değeri storage key'i
const SPLIT_PREF_KEY = "personelTakipSplitPrefs_v1";
// Varsayılan split prefs (her ekip için DEFAULT_MAX_ROWS_PER_COLUMN)
let splitPrefs = TEAM_CONFIG.reduce((acc, t) => { acc[t.key] = DEFAULT_MAX_ROWS_PER_COLUMN; return acc; }, {});

const sampleState = structuredClone(emptyState);
// Örnek verileri sadece bazı ekiplerde dolduruyoruz
sampleState.dis.entries = [
    { name: "Yalın", amount: 9401 },
    { name: "Müjde", amount: 5673 },
    { name: "Yaren", amount: 5229 },
    { name: "Emirhan", amount: 5150 },
    { name: "Görkem", amount: 4888 },
    { name: "Miray", amount: 4710 },
    { name: "Derin", amount: 1775 },
    { name: "Osman", amount: 1526 },
    { name: "Berfu", amount: 1500 },
    { name: "Ercan", amount: 1314 },
    { name: "Ayaz", amount: 1248 },
    { name: "Ezel", amount: 1229 },
    { name: "Alpaslan", amount: 1121 },
    { name: "Demir", amount: 1034 },
    { name: "Ediz", amount: 1031 },
    { name: "Selda", amount: 1000 },
    { name: "Hayat", amount: 1000 },
];
sampleState.vip.entries = [
    { name: "Zehra", amount: 7650 },
    { name: "Rüzgar", amount: 5420 },
    { name: "Asya", amount: 4980 },
];

const LAYOUT_PREF_KEY = "personelTakipLayoutPrefs_v1";
const DEFAULT_LAYOUT_PREF = TEAM_CONFIG.reduce((acc, t) => { acc[t.key] = false; return acc; }, {});

if (typeof structuredClone !== "function") {
    window.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

const currencyFormatterWhole = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

const currencyFormatterFull = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

let state = loadState();
let layoutPrefs = loadLayoutPrefs();
splitPrefs = loadSplitPrefs();

const tplTeamCard = document.getElementById("team-card-template");
const tplAdminPanel = document.getElementById("admin-panel-template");
const tplAdminRow = document.getElementById("admin-row-template");

const dashboardContainer = document.getElementById("dashboard-container");
const adminContainer = document.getElementById("admin-container");
const teamSelectorList = document.getElementById("team-selector");

const saveBtn = document.getElementById("save-data");
const resetBtn = document.getElementById("reset-data");
const sampleBtn = document.getElementById("pull-sample");
const tableSettingsList = document.querySelector("#table-settings .table-settings__list");
const tableSettingsSection = document.getElementById("table-settings");
const tableSettingsToggle = document.getElementById("table-settings-toggle");
const TABLE_SETTINGS_OPEN_KEY = "personelTakipTableSettingsOpen_v1";
const navButtons = document.querySelectorAll(".nav-btn");
const yearLabel = document.getElementById("year");
const globalAlignBtn = document.getElementById("toggle-align");
const monthPicker = document.getElementById("month-picker");
const monthLabelEl = document.getElementById("month-label");
const MONTH_STORAGE_KEY = "personelTakipSelectedMonth_v1";

yearLabel.textContent = new Date().getFullYear();

// Ay seçimi yönetimi
function getCurrentMonthValue() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
}

const MONTHS_TR = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

function formatMonthLabel(value) {
    if (!value || typeof value !== "string" || !/^[0-9]{4}-[0-9]{2}$/.test(value)) {
        return "";
    }
    const [y, m] = value.split("-");
    const idx = Number(m) - 1;
    const name = MONTHS_TR[idx] || m;
    return `${name} ${y}`;
}

function loadSelectedMonth() {
    try {
        const saved = window.localStorage.getItem(MONTH_STORAGE_KEY);
        return saved && /^[0-9]{4}-[0-9]{2}$/.test(saved) ? saved : null;
    } catch (_) {
        return null;
    }
}

function persistSelectedMonth(value) {
    try { window.localStorage.setItem(MONTH_STORAGE_KEY, value); } catch (_) { /* noop */ }
}

function updateMonthUI(value) {
    if (monthPicker && monthPicker.value !== value) {
        monthPicker.value = value;
    }
    if (monthLabelEl) {
        monthLabelEl.textContent = formatMonthLabel(value);
    }
}

// Başlangıçta ayı yükle ve göster
const initialMonth = loadSelectedMonth() ?? getCurrentMonthValue();
updateMonthUI(initialMonth);
persistSelectedMonth(initialMonth);

// Değişiklikleri dinle
if (monthPicker) {
    monthPicker.addEventListener("change", (e) => {
        const value = e.currentTarget.value;
        if (/^[0-9]{4}-[0-9]{2}$/.test(value)) {
            persistSelectedMonth(value);
            updateMonthUI(value);
        }
    });
}

function loadState() {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return structuredClone(emptyState);
        }
        const parsed = JSON.parse(raw);
        // Tüm mevcut takımlar için kontrol et; yeni eklenenler eski kayıtlara eklensin
        TEAM_CONFIG.forEach(cfg => {
            if (!parsed[cfg.key] || !Array.isArray(parsed[cfg.key].entries)) {
                parsed[cfg.key] = structuredClone(emptyState[cfg.key]);
            }
        });
        return parsed;
    } catch (error) {
        console.error("Veri okunamadı, boş state kullanılacak", error);
        return structuredClone(emptyState);
    }
}
let activeTeam = loadSelectedTeam();
if (!TEAM_CONFIG.some(t => t.key === activeTeam)) {
    activeTeam = TEAM_CONFIG[0].key;
}

// İlk çizimler
buildTeamSelector();
renderTableSettings();
renderDashboard();
renderAdmin();
attachNavEvents();
attachGlobalEvents();
attachGlobalAlignButton();
attachTableSettingsToggle();

function persistState() {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error("localStorage yazılamadı", e);
        showToast("Veri kaydedilemedi (depoya erişilemiyor)", true);
    }
}

function loadLayoutPrefs() {
    try {
        const raw = window.localStorage.getItem(LAYOUT_PREF_KEY);
        if (!raw) {
            return { ...DEFAULT_LAYOUT_PREF };
        }
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_LAYOUT_PREF, ...parsed };
    } catch (error) {
        console.error("Yerleşim tercihleri okunamadı, varsayılan kullanılacak", error);
        return { ...DEFAULT_LAYOUT_PREF };
    }
}

function loadSplitPrefs() {
    try {
        const raw = window.localStorage.getItem(SPLIT_PREF_KEY);
        if (!raw) return { ...splitPrefs };
        const parsed = JSON.parse(raw);
        // yeni eklenen takımlar için default atama
        TEAM_CONFIG.forEach(cfg => { if (!parsed[cfg.key]) parsed[cfg.key] = DEFAULT_MAX_ROWS_PER_COLUMN; });
        return parsed;
    } catch (e) {
        console.warn("Split prefs okunamadı, varsayılan kullanılacak", e);
        return { ...splitPrefs };
    }
}

function persistSplitPrefs() {
    try { window.localStorage.setItem(SPLIT_PREF_KEY, JSON.stringify(splitPrefs)); } catch (_) { /* noop */ }
}

function persistLayoutPrefs() {
    window.localStorage.setItem(LAYOUT_PREF_KEY, JSON.stringify(layoutPrefs));
}

function renderDashboard() {
    dashboardContainer.innerHTML = "";
    const teamCfg = TEAM_CONFIG.find(t => t.key === activeTeam);
    if (!teamCfg) return;
    const entriesLen = state[teamCfg.key].entries?.length || 0;
    if (entriesLen === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.innerHTML = `Henüz <strong>${teamCfg.title}</strong> için kayıtlı personel yok.`;
        dashboardContainer.appendChild(empty);
        return;
    }

    const grid = document.createElement("div");
    grid.className = "dashboard__grid";

    [teamCfg].forEach((cfg) => {
        const card = tplTeamCard.content.cloneNode(true);
        const cardEl = card.querySelector(".team-card");
        cardEl.dataset.team = cfg.key;
        card.querySelector(".team-card__title").textContent = cfg.title;
        card.querySelector(".team-card__subtitle").textContent = cfg.subtitle;

        const isBalanced = Boolean(layoutPrefs[cfg.key]);

    const tableBody = card.querySelector("tbody.table-body");
    const tableHeadRow = card.querySelector("tr.table-head");
        const entries = state[cfg.key].entries || [];

        const maxRowsForTeam = splitPrefs[cfg.key] || DEFAULT_MAX_ROWS_PER_COLUMN;
        const columnCount = Math.max(Math.ceil(entries.length / maxRowsForTeam), 1);
        const columns = entries.length > 0
            ? groupIntoColumns(entries, columnCount, { maxRows: maxRowsForTeam, balanced: isBalanced })
            : Array.from({ length: columnCount }, () => []);

        const columnTemplate = createColumnTemplate(columnCount);
        cardEl.style.setProperty("--column-count", columnCount.toString());
        // Sadece bir sütun çifti varsa kart kompakt kalsın, birden fazla ise genişlesin
        if (columnCount > 1) {
            cardEl.classList.add("team-card--wide");
            // Geniş ekranlarda yer sıkıntısı olursa alt satıra geçmesin diye genişlikte ayar.
        } else {
            cardEl.classList.remove("team-card--wide");
            // Tek sütun için daha dar bir varsayılan genişlik:
            cardEl.style.setProperty("--card-width", "620px");
        }

    tableHeadRow.innerHTML = "";
    tableBody.innerHTML = "";

        // Mevcut colgroup'u temizle ve yeniden oluştur
        const existingColgroup = cardEl.querySelector("colgroup");
        if (existingColgroup) existingColgroup.remove();
        const colgroup = document.createElement("colgroup");
        for (let i = 0; i < columnCount; i += 1) {
            const colName = document.createElement("col");
            colName.className = "col-name";
            const colAmount = document.createElement("col");
            colAmount.className = "col-amount";
            colgroup.append(colName, colAmount);
        }
        cardEl.querySelector("table.team-card__table").prepend(colgroup);

        columns.forEach((_, index) => {
            const isFirst = index === 0;
            const isLast = index === columns.length - 1;
            const nameHeaderClasses = buildClassList([
                isFirst ? "header-first" : undefined,
                isFirst ? undefined : "pair-start",
            ]);
            const amountHeaderClasses = buildClassList([
                "amount",
                isLast ? "header-last" : "pair-separator",
            ]);
            tableHeadRow.append(
                createHeaderCell("Personel Adı", nameHeaderClasses),
                createHeaderCell("Prim Hakedişi", amountHeaderClasses),
            );
        });

        if (entries.length === 0) {
            const row = document.createElement("tr");
            row.className = "table-row table-row--empty";
            const td = document.createElement("td");
            td.colSpan = columnCount * 2;
            td.textContent = "Kayıt bulunamadı";
            row.appendChild(td);
            tableBody.appendChild(row);
        } else {
            const rowCount = columns.reduce((max, col) => Math.max(max, col.length), 0);

            for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
                const row = document.createElement("tr");
                row.className = "table-row";

                columns.forEach((col, colIndex) => {
                    const entry = col[rowIndex];
                    const isFirst = colIndex === 0;
                    const isLast = colIndex === columns.length - 1;

                    const nameCellClasses = buildClassList([
                        isFirst ? "cell-first" : "pair-start",
                    ]);
                    const amountCellClasses = buildClassList([
                        "amount",
                        isLast ? "cell-last" : "pair-separator",
                    ]);

                    row.append(
                        createTableCell(entry?.name ?? "", nameCellClasses),
                        createTableCell(formatAmount(entry?.amount), amountCellClasses),
                    );
                });

                tableBody.appendChild(row);
            }
        }

        const footerValues = card.querySelectorAll(".footer-stat__value");
        footerValues[0].textContent = entries.length.toString();
        const total = entries.reduce((acc, item) => acc + Number(item.amount || 0), 0);
        footerValues[1].textContent = formatAmount(total, { withCents: true });

        grid.appendChild(card);
    });

    dashboardContainer.appendChild(grid);
}

function groupIntoColumns(list, columnCount, { maxRows = DEFAULT_MAX_ROWS_PER_COLUMN, balanced = false } = {}) {
    if (!Array.isArray(list) || list.length === 0) {
        return Array.from({ length: columnCount }, () => []);
    }

    if (balanced && columnCount > 1) {
        const result = [];
        const total = list.length;
        const base = Math.floor(total / columnCount);
        let remainder = total % columnCount;
        let startIndex = 0;

        for (let i = 0; i < columnCount; i += 1) {
            const extra = remainder > 0 ? 1 : 0;
            remainder -= extra;
            const size = Math.min(maxRows, base + extra);
            result.push(list.slice(startIndex, startIndex + size));
            startIndex += size;
        }

        while (result.length < columnCount) {
            result.push([]);
        }

        return result;
    }

    const result = [];
    for (let i = 0; i < columnCount; i += 1) {
        const start = i * maxRows;
        const end = start + maxRows;
        result.push(list.slice(start, end));
    }
    return result;
}

function createColumnTemplate(columnCount) {
    if (columnCount <= 0) {
        return "1.3fr 0.7fr";
    }
    const parts = [];
    for (let i = 0; i < columnCount; i += 1) {
        parts.push("1.3fr", "0.7fr");
    }
    return parts.join(" ");
}

function createTableCell(value, extraClass) {
    const td = document.createElement("td");
    if (value !== undefined && value !== null) {
        td.textContent = value;
    }
    addClasses(td, extraClass);
    return td;
}

function createHeaderCell(label, extraClass) {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = label;
    addClasses(th, extraClass);
    return th;
}

function addClasses(el, extraClass) {
    if (!extraClass) return;
    if (Array.isArray(extraClass)) {
        extraClass.forEach((cls) => cls && el.classList.add(cls));
    } else {
        el.classList.add(extraClass);
    }
}

function buildClassList(list) {
    if (!Array.isArray(list)) {
        return list;
    }
    return list.filter(Boolean);
}

function formatAmount(value, { withCents = false } = {}) {
    if (value === undefined || value === null || value === "") {
        return "";
    }
    const numeric = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(numeric)) {
        return "";
    }
    return withCents ? currencyFormatterFull.format(numeric) : currencyFormatterWhole.format(numeric);
}

function renderAdmin() {
    adminContainer.innerHTML = "";
    const cfg = TEAM_CONFIG.find(t => t.key === activeTeam);
    if (!cfg) return;
        const panel = tplAdminPanel.content.cloneNode(true);
        panel.querySelector(".admin-panel").dataset.team = cfg.key;
        panel.querySelector(".admin-panel__title").textContent = cfg.title;
        panel.querySelector(".admin-panel__subtitle").textContent = "Personel listesi ve prim tutarlarını düzenleyin.";

        const entriesList = panel.querySelector(".admin-list.entries");
        const entries = state[cfg.key].entries || [];

        if (entries.length === 0) {
            entriesList.appendChild(createAdminRow());
        } else {
            entries.forEach((item) => entriesList.appendChild(createAdminRow(item)));
        }

        const importBtn = panel.querySelector(".admin-import__btn");
        const importInput = panel.querySelector(".admin-import__input");

        if (importBtn && importInput) {
            importBtn.addEventListener("click", () => importInput.click());
            importInput.addEventListener("change", async (event) => {
                const inputEl = event.currentTarget;
                const file = inputEl?.files?.[0];
                if (!file) {
                    return;
                }

                try {
                    const importedEntries = await importFromExcel(file);

                    entriesList.innerHTML = "";
                    if (importedEntries.length === 0) {
                        entriesList.appendChild(createAdminRow());
                    } else {
                        importedEntries.forEach((item) => entriesList.appendChild(createAdminRow(item)));
                    }

                    const newState = structuredClone(state);
                    newState[cfg.key].entries = importedEntries;
                    state = newState;

                    renderDashboard();
                    showToast(`${cfg.title} için ${importedEntries.length} kayıt içe aktarıldı. Kaydet'e basmayı unutmayın.`);
                } catch (error) {
                    console.error(error);
                    showToast(error.message || "Excel dosyası içe aktarılamadı", true);
                } finally {
                    if (inputEl) {
                        inputEl.value = "";
                    }
                }
            });
        }

        const addBtn = panel.querySelector(".add-entry");
        addBtn.addEventListener("click", () => {
            entriesList.appendChild(createAdminRow());
            const lastRow = entriesList.lastElementChild;
            lastRow?.querySelector("input[name='name']")?.focus();
        });

        adminContainer.appendChild(panel);
}

function createAdminRow(data = { name: "", amount: "" }) {
    const row = tplAdminRow.content.cloneNode(true);
    const rowEl = row.querySelector(".admin-row");

    const nameInput = rowEl.querySelector("input[name='name']");
    const amountInput = rowEl.querySelector("input[name='amount']");

    nameInput.value = data.name || "";
    amountInput.value = data.amount !== undefined && data.amount !== null ? data.amount : "";

    const deleteBtn = rowEl.querySelector(".delete-row, .row-btn--danger");
    deleteBtn.addEventListener("click", () => {
        const parent = rowEl.parentElement;
        rowEl.remove();
        if (parent && parent.children.length === 0) {
            parent.appendChild(createAdminRow());
        }
    });

    rowEl.querySelector(".move-up").addEventListener("click", () => {
        const prev = rowEl.previousElementSibling;
        if (prev) {
            rowEl.parentElement.insertBefore(rowEl, prev);
        }
    });

    rowEl.querySelector(".move-down").addEventListener("click", () => {
        const next = rowEl.nextElementSibling;
        if (next) {
            rowEl.parentElement.insertBefore(next, rowEl);
        }
    });

    return row;
}

function collectAdminData() {
    const result = structuredClone(emptyState);

    adminContainer.querySelectorAll(".admin-panel").forEach((panel) => {
        const teamKey = panel.dataset.team;
        const entries = [];
        const seen = new Set();

        panel.querySelectorAll(".admin-row").forEach((row) => {
            const name = row.querySelector("input[name='name']").value.trim();
            const amountValue = row.querySelector("input[name='amount']").value.trim();
            if (!name && !amountValue) {
                return;
            }
            const amount = parseFloat(amountValue.replace(",", "."));
            if (!name) {
                row.querySelector("input[name='name']").focus();
                throw new Error("Personel adı boş bırakılamaz");
            }
            if (Number.isNaN(amount)) {
                row.querySelector("input[name='amount']").focus();
                throw new Error("Geçerli bir prim tutarı girin");
            }
            const key = name.toLowerCase();
            if (seen.has(key)) {
                row.querySelector("input[name='name']").focus();
                throw new Error(`Aynı isim iki kez girildi: ${name}`);
            }
            seen.add(key);
            entries.push({ name, amount });
        });

        result[teamKey].entries = entries;
    });

    return result;
}

async function importFromExcel(file) {
    if (!file) {
        throw new Error("Dosya seçilmedi");
    }
    if (typeof XLSX === "undefined") {
        throw new Error("Excel desteği yüklenemedi");
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const [firstSheetName] = workbook.SheetNames;
    if (!firstSheetName) {
        throw new Error("Excel sayfası bulunamadı");
    }

    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true, defval: "" });
    const entries = [];

    rows.forEach((row, index) => {
        if (!row || row.length === 0) {
            return;
        }

        const [nameCell, amountCell] = row;
        const name = (nameCell ?? "").toString().trim();
        const amount = parseExcelAmount(amountCell);
        const isHeaderLike = index === 0 && (
            name.toLowerCase().includes("personel") ||
            (amountCell ?? "").toString().toLowerCase().includes("prim")
        );

        if (isHeaderLike) {
            return;
        }

        if (!name && (amount === null || amount === undefined)) {
            return;
        }

        if (!name) {
            throw new Error(`Satır ${index + 1}: Personel adı boş olamaz`);
        }

        if (amount === null || Number.isNaN(amount)) {
            throw new Error(`Satır ${index + 1}: Prim değeri okunamadı`);
        }

        const normalizedAmount = Math.round(Number(amount) * 100) / 100;
        entries.push({ name, amount: normalizedAmount });
    });

    if (entries.length === 0) {
        throw new Error("Excel dosyasında geçerli kayıt bulunamadı");
    }

    return entries;
}

function parseExcelAmount(value) {
    if (value === undefined || value === null || value === "") {
        return null;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    const stringValue = value
        .toString()
        .replace(/₺/gi, "")
        .replace(/\u00A0/g, "")
        .replace(/\s+/g, "")
        .replace(/\.(?=\d{3}(?:\D|$))/g, "")
        .replace(/,/g, ".");

    const numeric = Number(stringValue);
    return Number.isFinite(numeric) ? numeric : NaN;
}

function attachNavEvents() {
    navButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const targetId = btn.dataset.target;
            document.querySelectorAll(".view").forEach((view) => {
                view.classList.toggle("view--active", view.id === targetId);
            });
            navButtons.forEach((b) => b.classList.toggle("nav-btn--active", b === btn));
        });
    });
}

function buildTeamSelector() {
    teamSelectorList.innerHTML = "";
    TEAM_CONFIG.forEach(team => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "team-selector__btn" + (team.key === activeTeam ? " is-active" : "");
        btn.textContent = team.title;
        btn.addEventListener("click", () => {
            if (activeTeam === team.key) return;
            activeTeam = team.key;
            persistSelectedTeam(activeTeam);
            buildTeamSelector();
            renderDashboard();
            renderAdmin();
            // Global align butonunu güncelle
            if (globalAlignBtn) {
                const isBalanced = Boolean(layoutPrefs[activeTeam]);
                globalAlignBtn.setAttribute("aria-pressed", isBalanced ? "true" : "false");
                globalAlignBtn.textContent = isBalanced ? "Ortalı" : "Ortala";
                globalAlignBtn.title = isBalanced ? "Varsayılan sıraya dön" : "Sütunları eşitle";
            }
        });
        li.appendChild(btn);
        teamSelectorList.appendChild(li);
    });
}

function attachGlobalEvents() {
    saveBtn.addEventListener("click", () => {
        try {
            const updated = collectAdminData();
            state = updated;
            persistState();
            renderDashboard();
            showToast("Veriler kaydedildi");
            announceLive("Veriler kaydedildi");
        } catch (error) {
            showToast(error.message, true);
            announceLive(`Hata: ${error.message}`);
        }
    });

    resetBtn.addEventListener("click", () => {
        const confirmed = window.confirm("Tüm verileri silmek istediğinize emin misiniz?");
        if (!confirmed) return;
        state = structuredClone(emptyState);
        layoutPrefs = { ...DEFAULT_LAYOUT_PREF };
        splitPrefs = TEAM_CONFIG.reduce((acc, t) => { acc[t.key] = DEFAULT_MAX_ROWS_PER_COLUMN; return acc; }, {});
        persistState();
        persistLayoutPrefs();
        persistSplitPrefs();
        renderDashboard();
        renderAdmin();
        renderTableSettings();
        showToast("Tüm veriler temizlendi");
        announceLive("Tüm veriler temizlendi");
    });

    sampleBtn.addEventListener("click", () => {
        // Var olan verileri bozmadan aktif takımı doldurmak istersen ileride opsiyon eklenebilir
        state = structuredClone(sampleState);
        layoutPrefs = { ...DEFAULT_LAYOUT_PREF };
        splitPrefs = TEAM_CONFIG.reduce((acc, t) => { acc[t.key] = DEFAULT_MAX_ROWS_PER_COLUMN; return acc; }, {});
        persistState();
        persistLayoutPrefs();
        persistSplitPrefs();
        renderDashboard();
        renderAdmin();
        renderTableSettings();
        showToast("Örnek veriler yüklendi");
        announceLive("Örnek veriler yüklendi");
    });
}

function attachGlobalAlignButton() {
    if (!globalAlignBtn) return;
    function sync() {
        const isBalanced = Boolean(layoutPrefs[activeTeam]);
        globalAlignBtn.setAttribute("aria-pressed", isBalanced ? "true" : "false");
        globalAlignBtn.textContent = isBalanced ? "Ortalı" : "Ortala";
        globalAlignBtn.title = isBalanced ? "Varsayılan sıraya dön" : "Sütunları eşitle";
    }
    globalAlignBtn.addEventListener("click", () => {
        layoutPrefs = { ...layoutPrefs, [activeTeam]: !layoutPrefs[activeTeam] };
        persistLayoutPrefs();
        sync();
        renderDashboard();
    });
    // Aktif takım değişince çağrılacak şekilde team selector içinde buildTeamSelector sonrası sync tekrar çalışır.
    const originalBuildTeamSelector = buildTeamSelector;
    // Not overriding function here (already executed). Instead ensure sync initially:
    sync();
}

function attachTableSettingsToggle() {
    if (!tableSettingsToggle || !tableSettingsSection) return;
    // Başlangıçta önceki durum
    let isOpen = false;
    try { isOpen = window.localStorage.getItem(TABLE_SETTINGS_OPEN_KEY) === "1"; } catch(_) {}
    if (isOpen) {
        tableSettingsSection.classList.remove("is-collapsed");
        tableSettingsToggle.setAttribute("aria-expanded", "true");
        const content = tableSettingsSection.querySelector('.table-settings__content');
        if (content) content.hidden = false;
    }
    tableSettingsToggle.addEventListener("click", () => {
        const collapsed = tableSettingsSection.classList.toggle("is-collapsed");
        const expanded = !collapsed;
        tableSettingsToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
        const content = tableSettingsSection.querySelector('.table-settings__content');
        if (content) content.hidden = !expanded;
        try { window.localStorage.setItem(TABLE_SETTINGS_OPEN_KEY, expanded ? "1" : "0"); } catch(_) {}
    });
}

function showToast(message, isError = false) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.className = "toast";
    if (isError) {
        toast.classList.add("toast--error");
    }
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("toast--visible"));
    setTimeout(() => {
        toast.classList.remove("toast--visible");
        toast.addEventListener("transitionend", () => toast.remove(), { once: true });
    }, 2800);
}

function announceLive(msg) {
    const region = document.getElementById("live-region");
    if (!region) return;
    region.textContent = ""; // reset for some screen readers
    requestAnimationFrame(() => { region.textContent = msg; });
}

function persistSelectedTeam(key) {
    try { window.localStorage.setItem(SELECTED_TEAM_KEY, key); } catch (_) { /* noop */ }
}

function loadSelectedTeam() {
    try { return window.localStorage.getItem(SELECTED_TEAM_KEY) || TEAM_CONFIG[0].key; } catch (_) { return TEAM_CONFIG[0].key; }
}

// TABLO AYARLARI (Her ekip için satır -> sütun bölme değeri)
function renderTableSettings() {
    if (!tableSettingsList) return;
    tableSettingsList.innerHTML = "";
    TEAM_CONFIG.forEach(cfg => {
        const li = document.createElement("li");
        li.className = "table-settings__item";
        const label = document.createElement("span");
        label.className = "table-settings__label";
        label.textContent = cfg.title.replace(/EKİBİ|EKİP/gi, match => match.trim());
        const input = document.createElement("input");
        input.type = "number";
        input.min = "1";
        input.step = "1";
        input.className = "table-settings__input";
        input.value = splitPrefs[cfg.key] || DEFAULT_MAX_ROWS_PER_COLUMN;
        input.setAttribute("aria-label", `${cfg.title} sütun satır sınırı`);
        input.addEventListener("change", () => {
            let val = parseInt(input.value, 10);
            if (!Number.isFinite(val) || val < 1) val = DEFAULT_MAX_ROWS_PER_COLUMN;
            splitPrefs[cfg.key] = val;
            persistSplitPrefs();
            if (cfg.key === activeTeam) {
                renderDashboard();
            }
        });
        const suffix = document.createElement("span");
        suffix.className = "table-settings__suffix";
        suffix.textContent = "satırdan sonra ikiye böl";
        li.append(label, input, suffix);
        tableSettingsList.appendChild(li);
    });
}
