import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Help.css';

export default function Help() {
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top when loading the help page
    window.scrollTo({ top: 0, behavior: 'auto' });
    
    // Fetch the markdown file from the public directory
    fetch('/user-guide.md')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load documentation');
        }
        return response.text();
      })
      .then((text) => {
        setMarkdown(text);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching markdown:', error);
        setMarkdown('# Error\n\nFailed to load documentation. Please try again later.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="help-page">
      <div className="container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading documentation...</p>
          </div>
        ) : (
          <article className="markdown-body glass-panel">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdown}
            </ReactMarkdown>
          </article>
        )}
      </div>
    </div>
  );
}
