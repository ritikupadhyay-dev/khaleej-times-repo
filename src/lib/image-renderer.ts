import { kt_logo, khaleej_times_white_logo } from '../assets';

export type AspectRatio = '1:1' | '4:5' | '16:9' | '9:16';
export type TemplateId = 'classic' | 'modern-center' | 'minimal-top';

export interface RenderOptions {
    imageUrl: string;
    title: string;
    category: string;
    aspectRatio?: AspectRatio;
    template?: TemplateId;
}

/**
 * Determines the best aspect ratio to use based on the target platforms.
 * Priority: 9:16 (Story) > 16:9 (Landscape/YouTube) > 4:5 (Portrait/IG Feed) > 1:1 (Square)
 */
export const getBestAspectRatio = (platforms: string[]): AspectRatio => {
    const p = platforms.map(p => p.toLowerCase());
    
    // 1. Stories check
    if (p.includes('story') || p.includes('instagram_stories')) return '9:16';
    
    // 2. Instagram & Facebook check (prefers Portrait 4:5 as it's the premium standard for feed engagement)
    if (p.includes('instagram') || p.includes('facebook')) return '4:5';
    
    // 3. Landscape check (X/Twitter, YouTube, LinkedIn)
    if (p.includes('twitter') || p.includes('x') || p.includes('youtube') || p.includes('linkedin')) return '16:9';
    
    // 4. Default fallback
    return '1:1';
};

export const generateCompositedImage = async (options: RenderOptions): Promise<Blob> => {
    const { imageUrl, title, category, aspectRatio = '1:1' } = options;

    // Define dimensions based on aspect ratio (base dimension 1080)
    let width = 1080;
    let height = 1080;

    switch (aspectRatio) {
        case '4:5':
            height = 1350;
            break;
        case '16:9':
            height = 607.5; // (1080 * 9) / 16
            width = 1080;
            break;
        case '9:16':
            height = 1920;
            width = 1080;
            break;
    }

    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;

        const template = options.template || (localStorage.getItem('kt-post-template') as TemplateId) || 'classic';
        const logoImg = new Image();
        if (template === 'modern-center') {
            logoImg.src = khaleej_times_white_logo;
        } else {
            logoImg.src = kt_logo;
        }

        // Wait for both images to load
        Promise.all([
            new Promise((res, rej) => {
                img.onload = res;
                img.onerror = () => rej(new Error('Failed to load background image: ' + imageUrl));
            }),
            new Promise((res, rej) => {
                logoImg.onload = res;
                logoImg.onerror = () => rej(new Error('Failed to load KT logo'));
            })
        ]).then(() => {
            // 1. Draw Background Image (Cover style)
            const imgAspect = img.width / img.height;
            const canvasAspect = width / height;
            let drawWidth, drawHeight, offsetX, offsetY;

            if (imgAspect > canvasAspect) {
                drawHeight = height;
                drawWidth = height * imgAspect;
                offsetX = -(drawWidth - width) / 2;
                offsetY = 0;
            } else {
                drawWidth = width;
                drawHeight = width / imgAspect;
                offsetX = 0;
                offsetY = -(drawHeight - height) / 2;
            }

            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

            // 2. Bottom Gradient Overlay (Height-adjusted)
            const gradientHeight = height * 0.5;
            const gradient = ctx.createLinearGradient(0, height - gradientHeight, 0, height);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.85)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, height - gradientHeight, width, gradientHeight);

            // 3. Logo and Text Layout based on Template
            const padding = width * 0.055;
            const headlineFontSize = Math.floor(width * 0.06);
            const maxWidth = width - (padding * 2);
            const lineHeight = headlineFontSize * 1.2;
            
            // Helper for Text Wrapping
            const wrapText = (text: string, maxW: number) => {
                ctx.font = `900 ${headlineFontSize}px 'Rokkitt', serif`;
                const words = text.split(' ');
                let line = '';
                const lines = [];
                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + ' ';
                    const testWidth = ctx.measureText(testLine).width;
                    if (testWidth > maxW && n > 0) {
                        lines.push(line);
                        line = words[n] + ' ';
                    } else {
                        line = testLine;
                    }
                }
                lines.push(line);
                return lines;
            };

            const fullLines = wrapText(title, maxWidth);
            const maxLines = aspectRatio === '16:9' ? 2 : 4;
            const lines = fullLines.slice(0, Math.min(fullLines.length, maxLines));

            const template = options.template || (localStorage.getItem('kt-post-template') as TemplateId) || 'classic';

            if (template === 'classic') {
                // Logo Top Left
                const logoWidth = width * 0.15;
                const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
                ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
                ctx.shadowBlur = 15;
                ctx.drawImage(logoImg, padding, padding, logoWidth, logoHeight);
                ctx.shadowBlur = 0;

                // Category and Title Bottom Left
                const catPaddingX = padding * 0.4;
                const fontSize = Math.floor(width * 0.03);
                ctx.font = `bold ${fontSize}px 'Rokkitt', serif`;
                const catText = category.toUpperCase();
                const catWidth = ctx.measureText(catText).width;
                const boxHeight = fontSize * 1.8;
                const spacing = padding * 0.5;
                const totalTextHeight = boxHeight + spacing + (lines.length * lineHeight);
                const marginBottom = aspectRatio === '9:16' ? padding * 2.5 : padding * 1.5;
                const startY = height - marginBottom - totalTextHeight;

                ctx.fillStyle = '#0070c0';
                ctx.fillRect(padding, startY, catWidth + (catPaddingX * 2), boxHeight);
                ctx.fillStyle = '#ffffff';
                ctx.fillText(catText, padding + catPaddingX, startY + (boxHeight * 0.7));

                ctx.font = `900 ${headlineFontSize}px 'Rokkitt', serif`;
                let currentY = startY + boxHeight + spacing;
                for (const l of lines) {
                    ctx.fillText(l, padding, currentY + (headlineFontSize * 0.8));
                    currentY += lineHeight;
                }
            } else if (template === 'modern-center') {
                // Logo Top Center - Shifted down slightly
                const logoWidth = width * 0.35; // Enlarged for white logo
                const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
                const logoY = height * 0.08; // Shifted down
                
                ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
                ctx.shadowBlur = 20;
                ctx.drawImage(logoImg, (width - logoWidth) / 2, logoY, logoWidth, logoHeight);
                ctx.shadowBlur = 0;

                // Date and City below Logo
                const infoFontSize = Math.floor(width * 0.025);
                ctx.font = `bold ${infoFontSize}px 'Rokkitt', serif`;
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                const dateText = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
                const cityText = "DUBAI";
                ctx.fillText(`${dateText} | ${cityText}`, width / 2, logoY + logoHeight + (padding * 0.4));

                // Category and Title Bottom Center
                const fontSize = Math.floor(width * 0.035);
                ctx.font = `bold ${fontSize}px 'Rokkitt', serif`;
                const catText = category.toUpperCase();
                const catWidth = ctx.measureText(catText).width;
                const boxHeight = fontSize * 1.8;
                const spacing = padding * 0.6;
                const totalTextHeight = boxHeight + spacing + (lines.length * lineHeight);
                const marginBottom = aspectRatio === '9:16' ? padding * 3 : padding * 2;
                const startY = height - marginBottom - totalTextHeight;

                ctx.fillStyle = '#0070c0';
                ctx.fillRect((width - (catWidth + padding)) / 2, startY, catWidth + padding, boxHeight);
                ctx.fillStyle = '#ffffff';
                ctx.fillText(catText, width / 2, startY + (boxHeight * 0.7));

                ctx.font = `900 ${headlineFontSize}px 'Rokkitt', serif`;
                let currentY = startY + boxHeight + spacing;
                for (const l of lines) {
                    ctx.fillText(l.trim(), width / 2, currentY + (headlineFontSize * 0.8));
                    currentY += lineHeight;
                }
                ctx.textAlign = 'left';
            } else if (template === 'minimal-top') {
                // Top Border and Logo/Date
                const logoWidth = width * 0.12;
                const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(padding, padding + logoHeight + (padding * 0.4));
                ctx.lineTo(width - padding, padding + logoHeight + (padding * 0.4));
                ctx.stroke();

                ctx.drawImage(logoImg, padding, padding, logoWidth, logoHeight);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.font = `bold ${Math.floor(width * 0.025)}px 'Rokkitt', serif`;
                ctx.textAlign = 'right';
                ctx.fillText(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(), width - padding, padding + (logoHeight * 0.7));
                ctx.textAlign = 'left';

                // Vertical Accent and Title Bottom
                const accentWidth = width * 0.012;
                const marginBottom = aspectRatio === '9:16' ? padding * 3 : padding * 2;
                const totalTextHeight = lines.length * lineHeight;
                const startY = height - marginBottom - totalTextHeight;

                ctx.fillStyle = '#e1b250';
                ctx.fillRect(padding, startY + (headlineFontSize * 0.2), accentWidth, totalTextHeight);

                ctx.font = `italic 900 ${headlineFontSize}px 'Rokkitt', serif`;
                ctx.fillStyle = '#ffffff';
                let currentY = startY;
                for (const l of lines) {
                    ctx.fillText(l, padding + accentWidth + (padding * 0.5), currentY + (headlineFontSize * 0.8));
                    currentY += lineHeight;
                }
            }

            // Convert to Blob
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create blob'));
                }
            }, 'image/jpeg', 0.9);
        }).catch(reject);
    });
};
