package layout;

import merge.VisualInfo;

import javax.swing.*;
import javax.swing.text.AttributeSet.ColorAttribute;

import java.awt.*;

public class LayoutVisualizer {
	VisualInfo[] nodes;
	JFrame frame;
	JPanel panel;
	
    public LayoutVisualizer(VisualInfo[] nodes){
        this.frame = new JFrame();
        this.frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        this.frame.setVisible(true);
        this.frame.setSize(600, 400);
        
        this.nodes = nodes;

        JPanel panel = new JPanel() {
            @Override
            public void paintComponent(Graphics g) {
                super.paintComponent(g);
                Color myColor = new Color((float)(Math.random()), (float)(Math.random()), (float)(Math.random()));
                g.setColor(Color.BLUE);
                
                for(VisualInfo n: nodes) {
                	
                	g.fillRect((int)Math.round(n.getX()), (int)Math.round(n.getY()), 50, 30);
                }
                
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


