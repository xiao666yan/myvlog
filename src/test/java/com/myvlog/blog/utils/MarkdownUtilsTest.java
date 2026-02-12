package com.myvlog.blog.utils;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class MarkdownUtilsTest {

    @Test
    public void testRenderHtml() {
        String markdown = "# Hello\n\nThis is **bold** and *italic*.";
        String html = MarkdownUtils.renderHtml(markdown);
        
        assertTrue(html.contains("<h1 id=\"toc-0\">Hello</h1>"));
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
    public void testChineseHeading() {
        String markdown = "# 你好\n\n## 这里的 测试";
        String html = MarkdownUtils.renderHtml(markdown);
        
        assertTrue(html.contains("<h1 id=\"toc-0\">你好</h1>"));
        assertTrue(html.contains("<h2 id=\"toc-1\">这里的 测试</h2>"));
        
        var toc = MarkdownUtils.extractToc(markdown);
        assertEquals(2, toc.size());
        assertEquals("toc-0", toc.get(0).getId());
        assertEquals("toc-1", toc.get(1).getId());
    }

    @Test
    public void testDuplicateHeading() {
        String markdown = "# 测试\n\n# 测试";
        String html = MarkdownUtils.renderHtml(markdown);
        
        assertTrue(html.contains("<h1 id=\"toc-0\">测试</h1>"));
        assertTrue(html.contains("<h1 id=\"toc-1\">测试</h1>"));
        
        var toc = MarkdownUtils.extractToc(markdown);
        assertEquals(2, toc.size());
        assertEquals("toc-0", toc.get(0).getId());
        assertEquals("toc-1", toc.get(1).getId());
    }
}
