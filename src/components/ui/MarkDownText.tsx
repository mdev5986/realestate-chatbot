import React from "react";

interface MarkDownProps {
  text: string;
}

export const MarkDownText: React.FC<MarkDownProps> = ({ text = "" }) => {

  const parseMarkdown = (text: string) => {
    if (!text) return '';
    let parsed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    parsed = parsed.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    parsed = parsed.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    parsed = parsed.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    return parsed;
  };

  return <div
    className="prose max-w-none whitespace-pre-line"
    dangerouslySetInnerHTML={{ __html: parseMarkdown(text) }}
  />;
}
