#!/usr/bin/env python3
import markdown
from weasyprint import HTML, CSS

# Read the markdown file
with open('API_FLOW_DIAGRAM.md', 'r', encoding='utf-8') as f:
    md_content = f.read()

# Convert markdown to HTML
html_content = markdown.markdown(md_content)

# Add CSS styling for better PDF output
css_style = """
body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}
h1 {
    color: #333;
    border-bottom: 2px solid #333;
    padding-bottom: 10px;
}
h2 {
    color: #444;
    border-bottom: 1px solid #ccc;
    padding-bottom: 5px;
    margin-top: 30px;
}
h3 {
    color: #555;
    margin-top: 20px;
}
code {
    background-color: #f4f4f4;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: monospace;
}
pre {
    background-color: #f4f4f4;
    padding: 15px;
    border-radius: 5px;
    overflow-x: auto;
}
pre code {
    background-color: transparent;
    padding: 0;
}
ul, ol {
    margin-left: 20px;
}
li {
    margin-bottom: 5px;
}
"""

# Combine HTML with CSS
full_html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>{css_style}</style>
</head>
<body>
{html_content}
</body>
</html>
"""

# Generate PDF
HTML(string=full_html).write_pdf('API_FLOW_DIAGRAM.pdf')
print("PDF generated successfully: API_FLOW_DIAGRAM.pdf")
