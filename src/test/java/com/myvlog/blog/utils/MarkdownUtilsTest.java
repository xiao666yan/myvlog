package com.myvlog.blog.utils;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class MarkdownUtilsTest {

    @Test
    public void testRenderHtml() {
        String markdown = "# Hello\n\nThis is **bold** and *italic*.";
        String html = MarkdownUtils.renderHtml(markdown);
        
        // With HeadingAnchorExtension, h1 will have an id
        assertTrue(html.contains("<h1 id=\"hello\">Hello</h1>") || html.contains("<h1>Hello</h1>"));
        assertTrue(html.contains("<p>This is <strong>bold</strong> and <em>italic</em>.</p>"));
    }

    @Test
    public void testTable() {
        String markdown = "| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |";
        String html = MarkdownUtils.renderHtml(markdown);
        
        assertTrue(html.contains("<table>"));
        assertTrue(html.contains("<thead>"));
        assertTrue(html.contains("<tbody>"));
        assertTrue(html.contains("<td>Cell 1</td>"));
    }
    
    @Test
    public void testNullOrEmpty() {
        assertEquals("", MarkdownUtils.renderHtml(null));
        assertEquals("", MarkdownUtils.renderHtml(""));
    }
}
