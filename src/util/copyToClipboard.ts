// See https://stackoverflow.com/questions/51805395/navigator-clipboard-is-undefined
export async function copyToClipboard(textToCopy: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(textToCopy);
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;

    textArea.style.position = 'absolute';
    textArea.style.left = '-999999px';

    document.body.prepend(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
    } catch (e) {
      console.error(e);
    } finally {
      textArea.remove();
    }
  }
}
