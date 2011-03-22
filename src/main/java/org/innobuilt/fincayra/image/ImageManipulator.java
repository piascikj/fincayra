package org.innobuilt.fincayra.image;

import java.awt.Graphics;
import java.awt.GraphicsConfiguration;
import java.awt.GraphicsDevice;
import java.awt.GraphicsEnvironment;
import java.awt.HeadlessException;
import java.awt.Image;
import java.awt.Transparency;
import java.awt.image.BufferedImage;

import javax.swing.ImageIcon;

/*   Copyright 2010 Jesse Piascik
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/
public class ImageManipulator {
    private int scaleStrategy = Image.SCALE_SMOOTH;
    
    public BufferedImage resizeTo(BufferedImage image, int width, int height) {
        return toBufferedImage(image.getScaledInstance(width, height, getScaleStrategy()));
    }
 
    public BufferedImage resizeByWidth(BufferedImage image, int maxWidth) {
        double w = image.getWidth(null);
        double h = image.getHeight(null);
        int width = maxWidth;
        int height = (int) ((h / w) * maxWidth);
        return resizeTo(image, width, height);
    }
 
    public BufferedImage resizeByHeight(BufferedImage image, int maxHeight) {
        double w = image.getWidth(null);
        double h = image.getHeight(null);
        int width = (int) ((w / h) * maxHeight);
        int height = maxHeight;
        return resizeTo(image, width, height);
    }
 
    public BufferedImage resizeByMaxWidthOrHeight(BufferedImage image, 
                                                  int maxSize) {
        double w = image.getWidth(null);
        double h = image.getHeight(null);
        int width = 0;
        int height = 0;
        if(w > h) {
            width = maxSize;
            height = (int) ((h / w) * maxSize);
        } else {
            height = maxSize;
            width = (int) ((w / h) * maxSize);
        }
        return resizeTo(image, width, height);
    }
 
    public BufferedImage resizeByScale(BufferedImage image, double scale) {
        double w = image.getWidth(null);
        double h = image.getHeight(null);
        int width = (int) (w * scale);
        int height = (int) (h * scale);
        return resizeTo(image, width, height);
    }
    
    protected BufferedImage toBufferedImage(Image image) {
        if (image instanceof BufferedImage) {
            return (BufferedImage)image;
        }
    
        image = new ImageIcon(image).getImage();
    
        BufferedImage bimage = null;
        GraphicsEnvironment ge = GraphicsEnvironment.getLocalGraphicsEnvironment();
        try {
            int transparency = Transparency.OPAQUE;
    
            GraphicsDevice gs = ge.getDefaultScreenDevice();
            GraphicsConfiguration gc = gs.getDefaultConfiguration();
            bimage = gc.createCompatibleImage(
                image.getWidth(null), image.getHeight(null), transparency);
        } catch (HeadlessException e) {
        	//TODO Handle Exception
        }
    
        if (bimage == null) {
            int type = BufferedImage.TYPE_INT_RGB;
            bimage = new BufferedImage(image.getWidth(null), image.getHeight(null), type);
        }
        Graphics g = bimage.createGraphics();
        g.drawImage(image, 0, 0, null);
        g.dispose();
    
        return bimage;
    }

	public int getScaleStrategy() {
		return scaleStrategy;
	}

	public void setScaleStrategy(int scaleStrategy) {
		this.scaleStrategy = scaleStrategy;
	}

}
