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
        this.frame = new JFrame();
        this.frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        this.frame.setVisible(true);
        this.frame.setSize(center.getWidth(), center.getHeight());
        
        this.nodes = nodes;

        JPanel panel = new JPanel() {
            @Override
            public void paintComponent(Graphics g) {
                super.paintComponent(g);
                //Color myColor = new Color((float)(Math.random()), (float)(Math.random()), (float)(Math.random()));
                g.setColor(Color.GREEN);
       
                int actorCounter = numActors;
                for(VisualInfo n: nodes) {
                	int height = (int)(n.getHeight());
                    int width = (int)(n.getWidth());
                	if(actorCounter == 0) {
                		g.setColor(Color.BLUE);	
                	}
                	
                	g.fillRect((int)Math.round(n.getX()), (int)Math.round(n.getY()), width, height);
                	actorCounter--;
                }
                
                //set center
                g.setColor(Color.RED);
                g.fillRect((int)Math.round(center.getX()), (int)Math.round(center.getY()), 10, 10);
                
            }
        };
        frame.add(panel);


        frame.validate();
        frame.repaint(); 
    }
    
    public void update() {
    	frame.repaint(); 
    }
}


