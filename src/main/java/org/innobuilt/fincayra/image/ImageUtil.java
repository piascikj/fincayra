package org.innobuilt.fincayra.image;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.RenderingHints;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;

import javax.swing.ImageIcon;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
/**
 * @author jpiasci
 * 
 * Image utilities
 */
public class ImageUtil {
	private static final Logger LOGGER = LoggerFactory.getLogger(ImageUtil.class);

	/**
	 * Resize an image to the dimension passed in while keeping the image aspect ration
	 * 
	 * @param inImage
	 * @param largestDimension
	 * @return A BufferedImage resized to the largestDimension, but keeping it's aspect ratio
	 */
	public static BufferedImage resizeImage(Image inImage, int largestDimension) {
		BufferedImage outImage = null;
		try {
			double scale;
			int sizeDifference, originalImageLargestDim;

			// find biggest dimension
			if (inImage.getWidth(null) > inImage.getHeight(null)) {
				scale = (double) largestDimension / (double) inImage.getWidth(null);
				sizeDifference = inImage.getWidth(null) - largestDimension;
				originalImageLargestDim = inImage.getWidth(null);
			} else {
				scale = (double) largestDimension / (double) inImage.getHeight(null);
				sizeDifference = inImage.getHeight(null) - largestDimension;
				originalImageLargestDim = inImage.getHeight(null);
			}
			// create an image buffer to draw to
			outImage = new BufferedImage(100, 100, BufferedImage.TYPE_INT_RGB); // arbitrary
			Graphics2D g2d;
			AffineTransform tx;
			LOGGER.debug("scale={}", scale);
			if (scale < 1.0d) // only scale if desired size is smaller than
			// original
			{
				LOGGER.debug("scale < 1.0d");
				LOGGER.debug("sizeDifference={}", sizeDifference);
				int numSteps = sizeDifference / 100;
				LOGGER.debug("numSteps={}", numSteps);
				if (numSteps < 1) numSteps = 1;
				int stepSize = sizeDifference / numSteps;
				int stepWeight = stepSize / 2;
				int heavierStepSize = stepSize + stepWeight;
				int lighterStepSize = stepSize - stepWeight;
				int currentStepSize, centerStep;
				double scaledW = inImage.getWidth(null);
				double scaledH = inImage.getHeight(null);
				if (numSteps % 2 == 1) // if there's an odd number of steps
					centerStep = (int) Math.ceil((double) numSteps / 2d); // find
				// the center step
				else
					centerStep = -1; // set it to -1 so it's ignored
				// later
				Integer intermediateSize = originalImageLargestDim, previousIntermediateSize = originalImageLargestDim;
				Integer calculatedDim;
				for (Integer i = 0; i < numSteps; i++) {
					if (i + 1 != centerStep) // if this isn't the center
					// step
					{
						if (i == numSteps - 1) // if this is the last step
						{
							// fix the stepsize to account for decimal place
							// errors previously
							currentStepSize = previousIntermediateSize - largestDimension;
						} else {
							if (numSteps - i > numSteps / 2) // if we're
								// in the
								// first
								// half of
								// the
								// reductions
								currentStepSize = heavierStepSize;
							else
								currentStepSize = lighterStepSize;
						}
					} else // center step, use natural step size
					{
						currentStepSize = stepSize;
					}
					intermediateSize = previousIntermediateSize - currentStepSize;
					scale = (double) intermediateSize / (double) previousIntermediateSize;
					scaledW = (int) scaledW * scale;
					scaledH = (int) scaledH * scale;
					LOGGER.debug("scaledW={} scaledH={}",scaledW, scaledH);
					outImage = new BufferedImage((int) scaledW, (int) scaledH, BufferedImage.TYPE_INT_RGB);
					g2d = outImage.createGraphics();
					g2d.setBackground(Color.WHITE);
					g2d.clearRect(0, 0, outImage.getWidth(), outImage.getHeight());
					g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
					tx = new AffineTransform();
					tx.scale(scale, scale);
					g2d.drawImage(inImage, tx, null);
					g2d.dispose();
					inImage = new ImageIcon(outImage).getImage();
					previousIntermediateSize = intermediateSize;
				}
			} else {
				// just copy the original
				outImage = new BufferedImage(inImage.getWidth(null), inImage.getHeight(null),
						BufferedImage.TYPE_INT_RGB);
				g2d = outImage.createGraphics();
				g2d.setBackground(Color.WHITE);
				g2d.clearRect(0, 0, outImage.getWidth(), outImage.getHeight());
				tx = new AffineTransform();
				tx.setToIdentity(); // use identity matrix so image is
				// copied exactly
				g2d.drawImage(inImage, tx, null);
				g2d.dispose();
			}
		} catch (Exception ex) {
		}
		return outImage; // success
	}
}

