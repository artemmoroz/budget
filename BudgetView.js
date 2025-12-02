// ===== CONFIG =====
const API_KEY = "$2a$10$Wt9llNdvcsRBwbc2yTPc1u8oyrBHTfXWF6ER0T02PKAN9uvSUWopi";
const CURRENCY  = "zł";
const TITLE     = "Wee1222kly budget";
// JSONBin без meta в PUT
const BIN_URL   = "https://api.jsonbin.io/v3/b/692f21a8d0ea881f400e4de6";
// ==================

async function fetchBudget() {
    const url = BIN_URL+"?meta=false";
    const req = new Request(url);
    req.method = "GET";
    req.headers = {
        "X-Master-Key": API_KEY
    };
    const json = await req.loadJSON();
    return json;
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

    const data = await fetchBudget();
    const widget = new ListWidget();
    widget.setPadding(12, 12, 12, 12);
    widget.backgroundColor = new Color("#111111");

    // Заголовок
    const titleTxt = widget.addText(TITLE);
    titleTxt.font = Font.mediumSystemFont(12);
    titleTxt.textColor = Color.gray();

    widget.addSpacer(4);

    // Остаток крупным шрифтом
    const remaining = data.weekly_remaining ?? 0;
    const remainingTxt = widget.addText(remaining + " " + CURRENCY +" left");
    remainingTxt.font = Font.boldSystemFont(24);
    remainingTxt.textColor = Color.white();

    widget.addSpacer(4);

    // Лимит
    const limitTxt = widget.addText("Limit: " + data.weekly_limit+ " "+CURRENCY);
    limitTxt.font = Font.systemFont(11);
    limitTxt.textColor = Color.gray();

    // --- Категории ---
    const categories = (data.categories && typeof data.categories === "object")
        ? data.categories
        : null;

    if (categories) {
        widget.addSpacer(8);

        const catTitle = widget.addText("By category:");
        catTitle.font = Font.mediumSystemFont(11);
        catTitle.textColor = Color.gray();

        widget.addSpacer(2);

        // превращаем объект в массив пар [name, value]
        const entries = Object.entries(categories);

        // сортируем по сумме по убыванию
        entries.sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));

        // ограничим, чтобы не засрать виджет (например, топ-4)
        const topEntries = entries.slice(0, 4);

        for (const [name, value] of topEntries) {
            const row = widget.addStack();
            row.layoutHorizontally();

            const nameTxt = row.addText(name + " : ");
            nameTxt.font = Font.systemFont(11);
            nameTxt.textColor = Color.white();

            const valTxt = row.addText(value + " "+CURRENCY);
            valTxt.font = Font.boldSystemFont(11);
            valTxt.textColor = Color.white();
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
