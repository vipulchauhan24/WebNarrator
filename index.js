const btnPlay = document.getElementById("play");
const btnPause = document.getElementById("pause");
const btnStop = document.getElementById("stop");
const panes = document.getElementById("read-content");
const synth = window.speechSynthesis;
let utterance;

function breakIntoSentences(elem) {
  const text = elem.innerHTML;
  const sentences = text.split(/[\.\?\!\r\n]/g);
  const sentenceElement = document.createElement("rs:node");

  sentences.forEach((sentence) => {
    const myTag = document.createElement("rs:sent");
    myTag.innerHTML = sentence;
    sentenceElement.appendChild(myTag);
  });
  elem.innerHTML = sentenceElement.innerHTML;
}

function breakIntoWords(elem) {
  const wordRegex = /\b\w+\b/g;

  elem.childNodes.forEach((node) => {
    if (node.nodeType === 3) {
      const newWord = node.textContent.replace(
        wordRegex,
        "<rs:span class='rs-text__word'>$&</rs:span>"
      );
      const element = document.createElement("rs:word");
      element.innerHTML = newWord;
      node.replaceWith(element);
    } else {
      breakIntoWords(node);
    }
  });
}

btnPlay.addEventListener("click", function () {
  if (synth.paused) {
    paused = false;
    synth.resume();
    return;
  }
  breakIntoWords(panes);
  const words = [];
  panes.querySelectorAll(".rs-text__word").forEach((node) => {
    words.push({
      spoken: false,
      text: node.textContent,
      node: node,
    });
  });
  utterance = new SpeechSynthesisUtterance();
  const speechText = panes.textContent;
  utterance.text = speechText;
  utterance.addEventListener("boundary", (event) => {
    if (event.name !== "word") return;
    const { charIndex, charLength } = event;
    const word = speechText.slice(charIndex, charIndex + charLength);
    if (!words) return;

    words.forEach((word) => {
      word.node.style.background = "transparent";
    });

    for (let indx in words) {
      if (!words[indx].spoken && word.includes(words[indx].text)) {
        words[indx].node.style.background = "yellow";
        words[indx].spoken = true;
        break;
      }
    }
  });
  utterance.addEventListener("end", (event) => {
    words.forEach((word) => {
      word.node.style.background = "transparent";
    });
  });
  synth.speak(utterance);
});

btnPause.addEventListener("click", function () {
  paused = true;
  speechSynthesis.pause();
});

btnStop.addEventListener("click", function () {
  stopped = true;
  synth.cancel();
});
