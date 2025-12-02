// ===== CONFIG =====
const API_KEY = "$2a$10$Wt9llNdvcsRBwbc2yTPc1u8oyrBHTfXWF6ER0T02PKAN9uvSUWopi";
const CURRENCY  = "zł";
const TITLE     = "Weekly budget";
// JSONBin без meta в PUT
const BIN_URL   = "https://api.jsonbin.io/v3/b/692f21a8d0ea881f400e4de6";
// ==================

async function fetchBudget() {
    const url = `${BIN_URL}?meta=false`;
    const req = new Request(url);
    req.method = "GET";
    req.headers = {
        "X-Master-Key": API_KEY
    };
    const json = await req.loadJSON();
    return json;
}

function getBackgroundColor(remaining, limit) {
    if (!limit || limit <= 0) {
        // нейтральный серый, если лимит не задан
        return new Color("#E0E0E0");
    }

    const ratio = remaining / limit; // 0..1

    if (ratio >= 0.5) {
        // мягкий зелёный
        return new Color("#CDEFD3"); // пастельный зелёный
    } else if (ratio >= 0.2) {
        // мягкий жёлтый
        return new Color("#FFF3B0");
    } else {
        // мягкий красный
        return new Color("#FFC9C9");
    }
}

//@ts-check
/**
 * Create the widget
 * @param {{widgetParameter: string, debug: string}} config widget configuration
 */
async function createWidget(config) {
    const log = config.debug ? console.log.bind(console) : function () {};
    log(JSON.stringify(config, null, 2))

    // let message = 'Hello World!'
    // let param = config.widgetParameter
    // if (param != null && param.length > 0) {
    //     message = param
    // }

    const limit     = Number(data.weekly_limit ?? 0);
    const remaining = Number(data.weekly_remaining ?? 0);
    const spent     = limit ? (limit - remaining) : 0;

    const widget = new ListWidget();
    widget.setPadding(10, 10, 10, 10);
    widget.backgroundColor = getBackgroundColor(remaining, limit);

    // Для всех текстов используем тёмный цвет: пастельный фон → тёмный текст
    const textMainColor   = new Color("#111111");
    const textSecondary   = new Color("#555555");

    // Основной горизонтальный контейнер (3 колонки)
    const row = widget.addStack();
    row.layoutHorizontally();
    row.centerAlignContent();

    // Левая колонка (категории)
    const leftCol = row.addStack();
    leftCol.layoutVertically();
    leftCol.spacing = 2;

    row.addSpacer(8); // промежуток между левой колонкой и центром

    // Центральная колонка (основная информация)
    const centerCol = row.addStack();
    centerCol.layoutVertically();
    centerCol.centerAlignContent();
    centerCol.spacing = 4;

    row.addSpacer(8); // промежуток между центром и правой колонкой

    // Правая колонка (категории)
    const rightCol = row.addStack();
    rightCol.layoutVertically();
    rightCol.spacing = 2;

    // ----- Центр: заголовок + остаток -----
    const titleTxt = centerCol.addText(TITLE);
    titleTxt.font = Font.mediumSystemFont(12);
    titleTxt.textColor = textSecondary;
    titleTxt.centerAlignText();

    const remainingTxt = centerCol.addText(`${remaining} ${CURRENCY} left`);
    remainingTxt.font = Font.boldSystemFont(26);
    remainingTxt.textColor = textMainColor;
    remainingTxt.centerAlignText();

    if (limit > 0) {
        const percent = Math.max(0, Math.min(100, Math.round((remaining / limit) * 100)));
        const infoTxt = centerCol.addText(
            `Spent: ${spent} ${CURRENCY} (${percent}% left)`
        );
        infoTxt.font = Font.systemFont(11);
        infoTxt.textColor = textSecondary;
        infoTxt.centerAlignText();
    } else {
        const infoTxt = centerCol.addText(`No limit set`);
        infoTxt.font = Font.systemFont(11);
        infoTxt.textColor = textSecondary;
        infoTxt.centerAlignText();
    }

    // ----- Категории слева/справа -----
    const categories = (data.categories && typeof data.categories === "object")
        ? data.categories
        : null;

    if (categories) {
        const entries = Object.entries(categories);
        // сортируем по убыванию суммы
        entries.sort((a, b) => Number(b[1] ?? 0) - Number(a[1] ?? 0));

        // ограничим общим числом, скажем, 8 категорий максимум
        const maxTotal = 8;
        const sliced = entries.slice(0, maxTotal);

        // делим пополам: первая часть слева, вторая справа
        const midIndex = Math.ceil(sliced.length / 2);
        const leftItems  = sliced.slice(0, midIndex);
        const rightItems = sliced.slice(midIndex);

        function addCategoryRow(colStack, name, value) {
            const row = colStack.addStack();
            row.layoutHorizontally();

            // название категории
            const nameTxt = row.addText(`${name}`);
            nameTxt.font = Font.systemFont(11);
            nameTxt.textColor = textMainColor;

            row.addSpacer(4);

            // сумма
            const valTxt = row.addText(`${value} ${CURRENCY}`);
            valTxt.font = Font.mediumSystemFont(11);
            valTxt.textColor = textMainColor;
            valTxt.rightAlignText();
        }

        if (leftItems.length > 0) {
            const leftTitle = leftCol.addText("Categories");
            leftTitle.font = Font.mediumSystemFont(11);
            leftTitle.textColor = textSecondary;
            leftCol.addSpacer(2);

            for (const [name, valueRaw] of leftItems) {
                const value = Number(valueRaw ?? 0);
                addCategoryRow(leftCol, name, value);
            }
        }

        if (rightItems.length > 0) {
            const rightTitle = rightCol.addText(" ");
            rightTitle.font = Font.mediumSystemFont(11);
            rightTitle.textColor = textSecondary;
            rightCol.addSpacer(2);

            for (const [name, valueRaw] of rightItems) {
                const value = Number(valueRaw ?? 0);
                addCategoryRow(rightCol, name, value);
            }
        }
    }

    return widget;
}

// // ----- ENTRY POINT -----
// let widget = await createWidget();
// Script.setWidget(widget);
//
// // При запуске из Scriptable – превью по размеру
// if (!config.runsInWidget) {
//     // Для "широкого" вида удобнее смотреть medium
//     await widget.presentMedium();
// }
//
// Script.complete();


module.exports = {
    createWidget
}
