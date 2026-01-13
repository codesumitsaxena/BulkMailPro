
function htmlToText(html) {
  if (!html) return '';
  
  let text = html;
  
  // Replace common HTML tags with appropriate spacing
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<\/div>/gi, '\n');
  text = text.replace(/<\/li>/gi, '\n');
  text = text.replace(/<\/h[1-6]>/gi, '\n\n');
  
  // Remove all HTML tags
  text = text.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—');
  
  // Clean up whitespace
  text = text.replace(/\n\s*\n\s*\n/g, '\n\n'); // Max 2 line breaks
  text = text.replace(/[ \t]+/g, ' '); // Multiple spaces to single
  text = text.trim();
  
  return text;
}

module.exports = { htmlToText };