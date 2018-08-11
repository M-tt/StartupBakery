
let cardTemplate =
    '<div id="{$id}" class="mdl-card mdl-shadow--3dp questionnaire-card">' +
    '<div class="mdl-card__title">' +
    '<h2 class="mdl-card__title-text">{$title}</h2>' +
    '</div>' +
    '<div class="mdl-card__supporting-text">' +
    '{$text}' +
    '</div>' +
    '<div class="mdl-card__actions mdl-card--border">' +
    '<!--{$answer}-->' +
    '</div>' +
    '</div>';

let buttonTemplate =
    '<div id="{$id}" class="questionnaire-answer mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored" onclick="questionnaireNext(\'{$id}\')">' +
    '{$text}' +
    '</div> ' +
    '<!--{$answer}-->';

let visibleCards = [];
let qContainer = $("#questionnaireQuestionContainer");

function initQuestionnaire() {
    qContainer.html("");
    visibleCards = [];

    let initAnswer = answers.find(a => a.id === "aInit");
    let newCard = createQuestionCard(initAnswer);
    visibleCards.push(newCard);
}

function questionnaireNext(answerId) {
    let givenAnswer = answers.find(a => a.id === answerId);
    let newCard = {};

    if (givenAnswer.nextItem instanceof Question) {
        //generate new question card
        newCard = createQuestionCard(givenAnswer);
    } else {
        //generate result card
        newCard = createResultCard(givenAnswer);
    }

    let offset = (window.innerWidth + 20) + "px";

    let previousCard = visibleCards.pop();
    visibleCards.push(previousCard);
    visibleCards.push(newCard);

    componentHandler.upgradeDom();

    newCard[0].style = "top: -" + previousCard.outerHeight() + "px";
    newCard.animate({left: "+=" + offset}, 0, "swing");
    newCard.animate({left: "-=" + offset}, 400, "swing");

    previousCard.animate({left: "-" + offset}, 400, "swing", function() {
        visibleCards[0].remove();
        newCard[0].style = "";
        visibleCards.shift();
    });
}

function createQuestionCard(givenAnswer) {
    let next = givenAnswer.nextItem;

    let qTemplate = cardTemplate;
    qTemplate = qTemplate.replace(/{\$id}/g, next.id);
    qTemplate = qTemplate.replace(/{\$title}/g, next.title);
    qTemplate = qTemplate.replace(/{\$text}/g, next.text);

    for (let i in next.answers) {
        let answer = next.answers[i];

        let aTemplate = buttonTemplate;
        aTemplate = aTemplate.replace(/{\$id}/g, answer.id);
        aTemplate = aTemplate.replace(/{\$text}/g, answer.text);

        qTemplate = qTemplate.replace(/<!--{\$answer}-->/g, aTemplate);
    }

    qTemplate = qTemplate.replace(/<!--{\$answer}-->/g, "");

    return $(qTemplate).appendTo(qContainer);
}

function createResultCard(givenAnswer) {
    let result = givenAnswer.nextItem;

    let rTemplate = cardTemplate;
    rTemplate = rTemplate.replace(/{\$id}/g, result.id);
    rTemplate = rTemplate.replace(/{\$title}/g, result.rechtsform);
    rTemplate = rTemplate.replace(/{\$text}/g, result.text);

    let bTemplate = buttonTemplate;
    bTemplate = bTemplate.replace(/questionnaireNext\('{\$id}'\)/g, "switchToView('startView')");
    bTemplate = bTemplate.replace(/{\$id}/g, "resultOK");
    bTemplate = bTemplate.replace(/{\$text}/g, "OK");
    rTemplate = rTemplate.replace(/<!--{\$answer}-->/g, bTemplate);
    rTemplate = rTemplate.replace(/<!--{\$answer}-->/g, "");

    return $(rTemplate).appendTo(qContainer);
}

let questions = [];
let answers = [];
let results = [];

class Question {
    constructor(id, answerIds, title, text) {
        this.id = id;
        this.answerIds = answerIds;
        this.title = title;
        this.text = text;
        this.answers = [];
    }

    fetchAnswers() {
        for (let i in this.answerIds) {
            // noinspection JSUnfilteredForInLoop cause no
            let answerId = this.answerIds[i];
            let answer = answers.find((a => a.id === answerId));
            if (answer) {
                this.answers.push(answer);
            } else {
                console.error("could not find answer with id " + answerId);
            }
        }
    }
}

class Answer {
    constructor(id, nextItemId, text) {
        this.id = id;
        this.nextitemId = nextItemId;
        this.text = text;
        this.nextItem = {};
    }

    fetchNextItem() {
        let nextItemId = this.nextitemId;
        let nextItem = questions.find(q => q.id === nextItemId);
        if (!nextItem) nextItem = results.find(q => q.id === nextItemId);

        if (nextItem) {
            this.nextItem = nextItem;
        } else {
            console.error("could not find question or result with id " + nextItemId);
        }
    }
}

class Result {
    constructor(id, rechtsform, text) {
        this.id = id;
        this.rechtsform = rechtsform;
        this.text = text;
    }
}

//=================QUESTIONS=================//
questions.push(new Question("qStart", ["aStart1", "aStart2"], "Gründungsmitglieder", "Gründest du alleine oder hast du Mitgründer?"));
questions.push(new Question("qSoloHaftung", ["aSoloPrivat", "aSoloFirma"], "Haftung", "Für den Fall, dass deine Idee nicht funktionieren sollte oder finanzielle Probleme auftreten (wovon wir nicht ausgehen ;)), ist von der Rechtsform abghängig, ob mit dem persönlichen oder dem Gesellschaftsvermögen gehaftet wird."));
questions.push(new Question("qSoloKapital", ["aSoloKapital<", "aSoloKapital>="], "Kapital", "Wie hoch ist dein Startkapital bzw. wie viel bist du bereit zu investieren?"));
questions.push(new Question("qSoloKatalog", ["aSoloKatalogY", "aSoloKatalogN"], "Katalogberuf", "Machst du dich in einem der folgenden Berufsfelder selbstständig? <ul><li>Heilberuf</li><li>Rechts-/Steuer-/Wirtschaftsberatender Beruf</li><li>Kultureller Beruf</li><li>Naturwissenschaftlicher/technischer Beruf</li></ul>"));
questions.push(new Question("qSoloFragenJa", ["aSoloFragenJaY", "aSoloFragenJaN"], "Fragenkatalog", "Kannst du alle der folgenden Fragen mit \"Ja\" beantworten? <ul><li>Hast du für deine Tätigkeit eine besondere berufliche Qualifikation?</li><li>Erbringst du geistige, schöpferische oder ideelle Leistungen?</li><li>Setzen deine Kunden in fachlicher Hinsicht auf ein besonderes Vertrauen deiner Arbeit?</li><li>Können sich deine Kunden frei für deine Leistungen entscheiden?</li><li>Erbringst du deine Leistungen persönlich (nicht durch Mitarbeiter)?</li><li>Bist du leitend verantwortlich für die Dinge in deinem Unternehmen?</li><li>Triffst du fachliche Entscheidungen frei und unabhängig?</li></ul>"));
questions.push(new Question("qSoloFreiberufler", ["aSoloFreiberuflerY", "aSoloFreiberuflerN"], "Freiberufler?", "Aufgrund deiner vorherigen Antworten könntest du ein \"Freiberufler\" sein und würdest von bestimmten Vorteilen profitieren: <ul><li>Keine Gewerbesteuer</li><li>Kein Handelsregistereintrag</li><li>Keine IHK-Mitgliedschaft</li><li>Keine Doppelte Buchführung (EÜR genügt)</li></ul>Wir raten dazu, diese Vorteile mitzunehmen. Willst du Freiberufler werden?"));

questions.push(new Question("qTeamHaftung", ["aTeamPrivat", "aTeamFirma"], "Haftung", "Für den Fall, dass eure Idee nicht funktionieren sollte oder finanzielle Probleme auftreten (wovon wir nicht ausgehen ;)), ist von der Rechtsform abghängig, ob mit dem persönlichen oder dem Gesellschaftsvermögen gehaftet wird."));
questions.push(new Question("qTeamKapital", ["aTeamKapital<", "aTeamKapital>="], "Kapital", "Wie hoch ist euer Startkapital bzw. wie viel seid ihr bereit zu investieren?"));
questions.push(new Question("qTeamKatalog", ["aTeamKatalogY", "aTeamKatalogN"], "Katalogberuf", "Macht ihr euch in einem der folgenden Berufsfelder selbstständig? <ul><li>Heilberuf</li><li>Rechts-/Steuer-/Wirtschaftsberatender Beruf</li><li>Kultureller Beruf</li><li>Naturwissenschaftlicher/technischer Beruf</li></ul>"));
questions.push(new Question("qTeamFragenJa", ["aTeamFragenJaY", "aTeamFragenJaN"], "Fragenkatalog", "Könnt ihr alle der folgenden Fragen mit \"Ja\" beantworten? <ul><li>Habt ihr für eure Tätigkeiten eine besondere berufliche Qualifikation?</li><li>Erbringt ihr geistige, schöpferische oder ideelle Leistungen?</li><li>Setzen eure Kunden in fachlicher Hinsicht auf ein besonderes Vertrauen eurer Arbeit?</li><li>Können sich eure Kunden frei für eure Leistungen entscheiden?</li><li>Erbringt ihr eure Leistungen persönlich (nicht durch Mitarbeiter)?</li><li>Seid ihr leitend verantwortlich für die Dinge in eurem Unternehmen?</li><li>Trefft ihr fachliche Entscheidungen frei und unabhängig?</li></ul>"));
questions.push(new Question("qTeamPartG", ["aTeamPartGY", "aTeamPartGN"], "Partnerschaftsgesellschaft?", "Aufgrund eurer vorherigen Antworten könntet ihr ein Zusammenschluss aus \"Freiberufler\" sein und würdet von bestimmten Vorteilen profitieren: <ul><li>Keine Gewerbesteuer</li><li>Kein Handelsregistereintrag</li><li>Keine IHK-Mitgliedschaft</li><li>Keine Doppelte Buchführung (EÜR genügt)</li></ul>Wir raten dazu, diese Vorteile mitzunehmen. Wollt ihr Freiberufler werden?"));

//=================ANSWERS=================//
answers.push(new Answer("aInit", "qStart", ""));
answers.push(new Answer("aStart1", "qSoloHaftung", "Alleine"));
answers.push(new Answer("aStart2", "qTeamHaftung", "2 oder Mehr"));

answers.push(new Answer("aSoloPrivat", "qSoloKatalog", "Persönlich"));
answers.push(new Answer("aSoloFirma", "qSoloKapital", "Gesellschaftsvermögen"));
answers.push(new Answer("aSoloKapital<", "rUG", "weniger als 12.500€"));
answers.push(new Answer("aSoloKapital>=", "rGmbH", "mehr als 12.500€"));
answers.push(new Answer("aSoloKatalogY", "qSoloFreiberufler", "Ja"));
answers.push(new Answer("aSoloKatalogN", "qSoloFragenJa", "Nein"));
answers.push(new Answer("aSoloFragenJaY", "qSoloFreiberufler", "Ja"));
answers.push(new Answer("aSoloFragenJaN", "rEinzelunternehmen", "Nein"));
answers.push(new Answer("aSoloFreiberuflerY", "rFreiberufler", "Ja"));
answers.push(new Answer("aSoloFreiberuflerN", "rEinzelunternehmen", "Nein"));

answers.push(new Answer("aTeamPrivat", "qTeamKatalog", "Persönlich"));
answers.push(new Answer("aTeamFirma", "qTeamKapital", "Gesellschaftsvermögen"));
answers.push(new Answer("aTeamKapital<", "rUG", "< 12.500€"));
answers.push(new Answer("aTeamKapital>=", "rGmbH", ">= 12.500€"));
answers.push(new Answer("aTeamKatalogY", "qTeamPartG", "Ja"));
answers.push(new Answer("aTeamKatalogN", "qTeamFragenJa", "Nein"));
answers.push(new Answer("aTeamFragenJaY", "qTeamPartG", "Ja"));
answers.push(new Answer("aTeamFragenJaN", "rGbR", "Nein"));
answers.push(new Answer("aTeamPartGY", "rPartG", "Ja"));
answers.push(new Answer("aTeamPartGN", "rGbR", "Nein"));

//=================RESULTS=================//
results.push(new Result("rEinzelunternehmen", "Einzelunternehmen", ""));
results.push(new Result("rUG", "UG (Haftungsbeschränkt)", ""));
results.push(new Result("rGmbH", "GmbH", "Du bist eine GmbH! Nach mir die Sintflut! yey!"));
results.push(new Result("rFreiberufler", "Freiberufler", "Du bist ein Freiberufler und darfst legal Steuern hinterziehen! yey!"));
results.push(new Result("rPartG", "Partnerschaftsgesellschaft", ""));
results.push(new Result("rGbR", "Gesellschaft bürgerlichen Rechts", ""));

questions.forEach(q => q.fetchAnswers());
answers.forEach(a => a.fetchNextItem());
