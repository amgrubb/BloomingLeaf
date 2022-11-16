package layout;

import merge.VisualInfo;

import javax.swing.*;
import javax.swing.text.AttributeSet.ColorAttribute;

import java.awt.*;

public class LayoutVisualizer {
	VisualInfo[] nodes;
	JFrame frame;
	JPanel panel;
	
    public LayoutVisualizer(VisualInfo[] nodes, VisualInfo center, int numActors){
    	if(LMain.DEBUG) this.frame = new JFrame();
        this.frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        this.frame.setVisible(true);
        this.frame.setSize(center.getWidth(), center.getHeight());
        
        this.nodes = nodes;

        JPanel panel = new JPanel() {
            @Override
            public void paintComponent(Graphics g) {
                super.paintComponent(g);
                Color myNewGreen = new Color (122, 179, 89); 
                Color myNewBlue = new Color (118, 148, 214);
                Color myNewRed = new Color (240, 135, 146);
                //Color myColor = new Color((float)(Math.random()), (float)(Math.random()), (float)(Math.random()));
                
                g.setColor(myNewGreen);//actors
       
                int actorCounter = numActors;
                for(VisualInfo n: nodes) {
                	int height = (int)(n.getHeight()/2);
                    int width = (int)(n.getWidth()/2);
                	if(actorCounter == 0) {
                		g.setColor(myNewBlue);//intentions	
                	}
                	
                	g.fillRect((int)Math.round(n.getX()), (int)Math.round(n.getY()), width, height);
                	actorCounter--;
                }
                
                //set center
                g.setColor(myNewRed);
                g.fillRect((int)Math.round(center.getX()), (int)Math.round(center.getY()), 10, 10);
                
            }
        };
        
        if(LMain.DEBUG) frame.add(panel);
        if(LMain.DEBUG) frame.validate();
        if(LMain.DEBUG) frame.repaint(); 
        
    }
    
    public void update() {
    	if(LMain.DEBUG) frame.repaint(); 
    }
}


