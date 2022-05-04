import { ReactNode } from "react";

const codeRegex = /(`.*?`)/g;
const functionRegex = /`@.*?\((.*?)\)`/g;

type DescriptionProps = { text: string };

function formatText(text: string) {
  return text.split(codeRegex).map((w, i) => {
    // Texts with code format at the begining usually return an empty string at the start
    const codeMatch = codeRegex.exec(w);

    return codeMatch ? (
      formatCode(w)
    ) : (
      <span key={i} style={{ color: "#D0BF9B" }}>
        {w}
      </span>
    );
  });
}

function formatCode(text: string) {
  const functionMatch = new RegExp(functionRegex).exec(text);

  if (functionMatch) {
    return formatFunction(text);
  }

  return text.split(/(`)(.*?)(`)/g).map((w) => {
    return (
      <span style={{ color: w === "`" ? "#D0BF9B" : "#5872FF" }}>{w}</span>
    );
  });
}

function getPartialFnColor(part: string, elementIndex: number) {
  if (elementIndex === 2) {
    return "#A2BEFC";
  }

  if (["`", "(", ")"].includes(part)) {
    return "#D0BF9B";
  }

  return "#ffffff";
}

function formatFunction(text: string): ReactNode {
  // Split and get [`,functionName, (, params, ), `]
  return text.split(/(`)(@.*?)(\()(.*)(\))/g).map((w, i) => {
    console.log("es la palabra", w);

    return (
      <span key={i} style={{ color: getPartialFnColor(w, i) }}>
        {w}
      </span>
    );
  });
}

function Description({ text }: DescriptionProps) {
  return <div>{formatText(text)}</div>;
}

export default Description;
