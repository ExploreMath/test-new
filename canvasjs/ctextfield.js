//-------------------------------------------------------------------------------------------------
// As text does not have a boundry, user must click on the text itself, not within the area.
// also, when all text is deleted or start with blank field, there's no click spot at all.
// to Resolve, draw a box over the textfield,
// use the dummy to detect the focus click instead.
//
//default all tf type are not input, 
//use SetInput to set it to input, not IsInput.	
//IsInput return if tf is an input or not	
//MaxChar 0 = infinite, set to limit number of char	
//MaxLine default 1 line, change to allow more number of new lines	
//use SetInputRange to change the input keys allowed, default ["num", "alp", "cap", "sym"]
//textalign will affect the x position, alightright will set the x to end of the field
//
//20160226 Add:
//Add new var "ShowKeyboard" to define which keyboard to be shown default qwerty
//"qwerty", "num", "compare" , "math" and "null"
//
//20160421
//SetInput accepts 1 more var, vUseCustomBorder
//	true : use custom border that's created at Main.js - fTextBorderStyle()
//	false : use default border
//	null/empty : no border
//
//vTarget.BGcolor give's dummytext a bg color for the field to be more prompting, rgba MaxChar 255
//
//If Language is set != "English", the Element Input will not be hidden, mainly for platform input
//-------------------------------------------------------------------------------------------------

function cTextField(vTarget) 
{		
	var mHitZone = null;	
	var mParent = vTarget.parent;
	var mKeyCode;		
	var mBorder = null;	
	
	var mCaret = null;
	var mHighLight = null;
	
	var mCursorCaret = -1;
	
	var mPartialSelection = [];	
	
	vTarget.Language = "English";
	vTarget.IsInput = false;
	vTarget.ShowFocusBorder = true;
	vTarget.MaxChar = 0;
	vTarget.MaxLine = 1;
	vTarget.InputRange = ["num", "alp", "cap", "sym"]; // default all 4 types
	vTarget.ShowKeyboard = "qwerty";
	vTarget.BGcolor = "rgba(0, 0, 0, 0.01)";	
	vTarget.IsFocus = false;
	//vTarget.mDefaultColor = (vTarget.color == undefined ? "#000000" : vTarget.color);
	
	vTarget.xSelectable = true;
	
	vTarget.addEventListener("removed", fRemoved); 				
			
	//require fRender to receive other signal to keep track event to handle partial select
	vTarget.fRender = function(vData) 
	{ 	 	
		var i;
		if(vData == "mousedown")
		{
			mPartialSelection = [];
			
			i = fCaretPosBaseMouse();
			mPartialSelection.push(i);
			
			for(i = 0 ; i < mHighLight.highlights.length ; i++)
				mHighLight.removeChild(mHighLight.highlights[i]);
			mHighLight.highlights = [];
		}
		else if(vData == "scrollmove")
		{
			mCaret.visible = false;	
			for(i = 0 ; i < mHighLight.highlights.length ; i++)
				mHighLight.removeChild(mHighLight.highlights[i]);
				
			i = fCaretPosBaseMouse();
			if(mPartialSelection.length >= 2)
				mPartialSelection.pop();
				
			mPartialSelection.push(i);
			
			vTarget.Highlight(true);
		}
		else if(vData == "click")
		{
			i = fCaretPosBaseMouse();
			if(mPartialSelection.length >= 2)
				mPartialSelection.pop();
			mPartialSelection.push(i);
			
			if(mPartialSelection[0] == mPartialSelection[1])
				mPartialSelection = [];
		}				
		
		if(vData == "dbclick")
			mPartialSelection = [];
	};
	
	vTarget.fEnable = function(vData)
	{			
		if(mHitZone != null)
			mHitZone.mouseEnabled = vData;
			
		this.xSelectable = vData;
		this.mouseEnabled = vData;
		this.Enabled = vData; 
		this.fRender();
	};	
			
	//--------------------------------------		
	vTarget.SetInputRange = function(vData){
		this.InputRange = vData;
		UpdateKeyCode();
	};	
	
	//--------------------------------------
	vTarget.SetInput = function(vData, vUseCustomBorder){	
		var i;		
		var o = "";
		var p;
		var mPoint = {};
		var shape;
		var xheight;
		//calculate front height run diff
		var vi1;
		var vi2;
		var vClone;
		var frontHeightdiff = 0;
		
		if(mHitZone != null)
		{
			this.parent.removeChild(mHitZone);
			this.parent.removeChild(mBorder);
			this.parent.removeChild(mCaret);
			this.parent.removeChild(mHighLight);
		}

		if(vData)
		{
			var Border;
			// create border
			// true: use custom border created at Main.js
			// false: use default border design
			// null/empty: no border design
			if(vUseCustomBorder == true)			
				Border = MAIN.fTextBorderStyle();			
			else if(vUseCustomBorder == false)
			{
				Border = new createjs.Shape();
				Border.graphics.beginStroke("#000");
				Border.graphics.setStrokeDash([10, 10], 0);
			}			
			else
				Border = new createjs.Shape();
			
			mPoint.width = 10;
			mPoint.height = 10;
			xheight = 10;

			if(vTarget.getBounds())
			{
				mPoint.width = vTarget.getBounds().width;
				mPoint.height = vTarget.getBounds().height;
				xheight = vTarget.getBounds().height * vTarget.scaleY;
				
				//check if have line width and if it's bigger than bound
				if(vTarget.lineWidth)
					if(vTarget.lineWidth > mPoint.width)
						mPoint.width = vTarget.lineWidth;
			}
			else if(vTarget.lineWidth)
			{
				mPoint.width = vTarget.lineWidth;
				mPoint.height = vTarget.lineHeight;
				xheight = vTarget.lineHeight;
			}				
						
			//Set bound to textfield(base on above possible width height)
			if(vTarget.textAlign == "right")
				vTarget.bottomRight = new createjs.Point(0, 0);
			else if(vTarget.textAlign == "center")	
				vTarget.bottomRight = new createjs.Point(mPoint.width / 2, xheight / 2);
			else
				vTarget.bottomRight = new createjs.Point(mPoint.width, xheight);			
			
			Border.graphics.drawRect(0, 0, mPoint.width , xheight + 5);
						
			p = vTarget.rotation;
			vTarget.rotation = 0;			
			
			if(vTarget.textAlign == "right")								
				Border.regX = mPoint.width;
			else if(vTarget.textAlign == "center")			
				Border.regX = (mPoint.width / 2);

			//-------------------------------------	
			//some font not supported will cause a drop in y height
			//trying to compansate the drop by checking if font height is 
			// larger than the should be height
			vClone = vTarget.clone();
			vClone.text = "T";

			vi1 = vClone.getMeasuredLineHeight();
			vi2 = vClone.lineHeight;
			
			if(	vi1 > vi2)
				frontHeightdiff = Math.ceil(vi1 - vi2);
			//-------------------------------------	
				
			Border.x = vTarget.x;				
			Border.y = vTarget.y + frontHeightdiff;	

			Border.rotation = p;			
			Border.visible = false;
			
			mBorder = Border;
			
			mBorder.scaleX = vTarget.scaleX;
			mBorder.scaleY = vTarget.scaleY;
			
			i = this.parent.getChildIndex(this);
			this.parent.addChildAt(mBorder, i);
			this.parent.swapChildren(this, mBorder);			
							
			//create blinking caret, 2 shapes required, 1 for the exact shape and Reg point of the textfield
			//another for the caret, add listener to listen on tick
			mCaret = new createjs.MovieClip();
			
			shape = new createjs.Shape();			
			shape.graphics.beginFill("rgba(0, 0, 0, 0)");
			shape.graphics.drawRect(0, 0, mPoint.width , xheight + 2);
			
			mCaret.setBounds(0, 0, mPoint.width , xheight + 2);			
			mCaret.addChild(shape);
			
			var caret = new createjs.Shape();	
			caret.graphics.beginStroke("#000");			
			caret.graphics.moveTo(0, 0);
			caret.graphics.lineTo(0, (mPoint.height / vTarget.getMetrics().lines.length) + 2);			 			
			
			if(vTarget.textAlign == "right")								
				mCaret.regX = mPoint.width;
			else if(vTarget.textAlign == "center")			
				mCaret.regX = (mPoint.width / 2);
			
			mCaret.x = vTarget.x;				
			mCaret.y = vTarget.y + frontHeightdiff;
			
			mCaret.rotation = p;
			
			mCaret.scaleX = vTarget.scaleX;
			mCaret.scaleY = vTarget.scaleY;
			
			mCaret.caret = caret;
			mCaret.addChild(caret);
			mCaret.visible = false;
			
			i = this.parent.getChildIndex(this);		
			
			this.parent.addChildAt(mCaret, i);
			this.parent.swapChildren(this, mCaret);	
			
			mCaret.delayme = 0;
			mCaret.addEventListener("tick", fBlink);
			
			//create Highlight shading holder, use to archive Highlighting of text
			mHighLight= new createjs.MovieClip();
			//base shape to same as the original textfield
			shape = new createjs.Shape();			
			shape.graphics.beginFill("rgba(0, 0, 0, 0)");
			shape.graphics.drawRect(0, 0, mPoint.width , xheight + 2);
			
			mHighLight.setBounds(0, 0, mPoint.width , xheight + 2);			
			mHighLight.addChild(shape);
						
			if(vTarget.textAlign == "right")								
				mHighLight.regX = mPoint.width;
			else if(vTarget.textAlign == "center")			
				mHighLight.regX = (mPoint.width / 2);
			
			mHighLight.x = vTarget.x;				
			mHighLight.y = vTarget.y + frontHeightdiff;
			
			mHighLight.rotation = p;
			mHighLight.SelectedText = [];
			
			mHighLight.scaleX = vTarget.scaleX;
			mHighLight.scaleY = vTarget.scaleY;
			
			mHighLight.highlights = [];
			mHighLight.visible = false;
			
			i = this.parent.getChildIndex(this);		
			
			this.parent.addChildAt(mHighLight, i);
			//don't swap index
			//this.parent.swapChildren(this, mHighLight);	
			
			//create dummy text for click spot, also use for bg coloring
			shape = new createjs.Shape();			
			shape.graphics.beginFill(vTarget.BGcolor);
			shape.graphics.drawRect(0, 0, mPoint.width, xheight + 5);				
			
			if(vTarget.textAlign == "right")								
				shape.regX = mPoint.width;
			else if(vTarget.textAlign == "center")			
				shape.regX = (mPoint.width / 2);
			
			shape.x = vTarget.x;	
			shape.y = vTarget.y + frontHeightdiff;	

			shape.rotation = p;
			vTarget.rotation = p;

			shape.setBounds(0, 0, mPoint.width, mPoint.height + 2);
			
			shape.scaleX = vTarget.scaleX;
			shape.scaleY = vTarget.scaleY;
			
			mHitZone = shape;
			
			cDummyText(mHitZone, vTarget);
			mHitZone.cursor = "text";		
			
			//add dummy text over the real text on parent
			i = this.parent.getChildIndex(this);			
			this.parent.addChildAt(mHitZone, i);
			this.parent.swapChildren(mHitZone, mBorder);
			this.parent.swapChildren(this, mBorder);
		}		
		this.IsInput = vData;
		fUpdateTextArea();
	};	
	
	vTarget.fKeyed = function(event){
		var i, j, k;
		var o, p, q;
		var vData = event.keyCode;

		var vUseText;
		vUseText = ["", ""];
		
		if((this.IsInput) && (vTarget.IsFocus))
		{		
			if(event.shiftKey)
				vData = "u" + vData;			
			
			//caret affecting text	
			if(this.text == "")
				mCursorCaret = -1;
				
			//respond to the left/right arrow pressed and shift the cursor position
			if ((vData == 37) || (vData == 39))
			{
				//clicking outside cause mCursorCaret value to be bigger than vTarget.text.length
				//	set mCursorCaret to vTarget.text.length so that left btn can be use
				if((vData == 37) && (mCursorCaret > vTarget.text.toString().length))
					mCursorCaret = vTarget.text.toString().length - 1;
	
				if((vData == 37) && (mCursorCaret > -1))
					mCursorCaret -= 1;
				else if((vData == 39) && (mCursorCaret < vTarget.text.toString().length - 1))
					mCursorCaret += 1;					
					
				for(i = 0 ; i < mHighLight.highlights.length ; i++)
					mHighLight.removeChild(mHighLight.highlights[i]);
				mHighLight.highlights = [];
			
				mHighLight.SelectedText = [];
				//vTarget.color = vTarget.mDefaultColor;	
				
				fDbg("mCursorCaret >>> " + mCursorCaret);
				
				fUpdateTextArea();					
				fUpdateCaretPos();	
				return;
			}	
			
			//respond to the up/down arrow pressed and shift the cursor position
			if ((vData == 40) || (vData == 38))
			{
				p = fCurrentLine();

				if( vData == 38)
				{
					if(vTarget.text != "")
					{
						//caret not in first line
						if((p[0] - 1) != 0)
							mCursorCaret = fMoveDirection("up");						
						else
						{
							//caret is in first line, change caret to point -1
							mCursorCaret = -1;
						}
					}
				}
				else
				{					
					if((p[2] > 1) || (p[2] == 1))
					{
						//caret on the last line, change to last point (max length)						
						if(p[0] == p[2])						
							mCursorCaret = vTarget.text.toString().length - 1;						
						else						
							mCursorCaret = fMoveDirection("down");						
					}
				}	
				fUpdateTextArea();					
				fUpdateCaretPos();	
				return;
			}	
			
			//handle highlights on text, todo: partial highlight
			if(mHighLight.highlights.length > 0)
			{
				if(mKeyCode.hasOwnProperty(vData))
				{
					switch(mKeyCode[vData])
					{
						case "Clr":
						case "delete":
						case "backspace":						
							this.text = "";
							mCursorCaret = -1;					
							try{
								event.preventDefault();
							}
							catch(err) {}
							break;								
							
						case "\n":	
						case "enter":
							if (this.getMetrics().lines.length < this.MaxLine)
							{								
								this.text = "\n";
								mCursorCaret = 0;
							}
							break;						
							
						default:			
							//replace as maxchar is 1 only and it's highlighted
							if(this.MaxChar == 1)
							{	
								this.text = mKeyCode[vData];
								mCursorCaret = 0;
							}
							//else if ((this.getMetrics().lines.length <= this.MaxLine) && ((String(this.text).length < this.MaxChar) || (this.MaxChar == 0)))
							else
							{
								//everything selected
								if ((mHighLight.SelectedText[0] == -1) && (mHighLight.SelectedText[1] == vTarget.text.toString().length-1))
								{
									vUseText[0] = mKeyCode[vData];
									this.text = vUseText.join("");
									mCursorCaret = 0;
								}
								else //partial selected
								{
									if(mHighLight.SelectedText[0] > mHighLight.SelectedText[1])
									{
										i = mHighLight.SelectedText[1];
										mHighLight.SelectedText[1] = mHighLight.SelectedText[0];
										mHighLight.SelectedText[0] = i;
									}

									vUseText[0] = String(this.text).substring(0, mHighLight.SelectedText[0] + 1); 
									vUseText[1] = String(this.text).substring(mHighLight.SelectedText[1] + 1);
									
									vUseText[0] += mKeyCode[vData];
									this.text = vUseText.join("");
									mCursorCaret = mHighLight.SelectedText[0] + 1;
					
								}
								//prevent char after space from dropping to next line,
								//remove the last input from the text
								if (this.getMetrics().lines.length > this.MaxLine)
								{
									this.text = "";
									mCursorCaret -= 1;
								}
							}
							break;
					}				
					fUpdateTextArea();					
					fUpdateCaretPos();
				}
				
				vTarget.IsFocus = true;
				for(i = 0 ; i < mHighLight.highlights.length ; i++)
					mHighLight.removeChild(mHighLight.highlights[i]);
				mHighLight.highlights = [];
			
				mHighLight.SelectedText = [];
				//vTarget.color = vTarget.mDefaultColor;
				
				fUpdateTextArea();					
				fUpdateCaretPos();
			}
			else //handle Key when no highlights on textfield
			{
				//repond to all other Key pressed
				if(mCursorCaret == -1)
				{
					vUseText[0] = "";
					vUseText[1] = String(this.text); //require treatment as string
				}
				else
				{												
					vUseText[0] = String(this.text).substring(0, mCursorCaret + 1); 
					vUseText[1] = String(this.text).substring(mCursorCaret + 1); 	
				}
	
				if(mKeyCode.hasOwnProperty(vData))
				{
					switch(mKeyCode[vData])
					{
						case "backspace":						
							if(String(this.text).length > 0)	
							{							
								vUseText[0] = String(vUseText[0]).slice(0, String(vUseText[0]).length - 1);	
								this.text = vUseText.join("");
								
								if(mCursorCaret > -1)
									mCursorCaret -= 1;
							}							
							try{
								event.preventDefault();
							}
							catch(err) {}
							break;
							
						case "delete":	
							if(String(this.text).length > 0)	
							{		
								if(vUseText[1].length > 0)
								{
									vUseText[1] = String(vUseText[1]).slice(1);	
									this.text = vUseText.join("");
								}
							}							
							break;
							
						case "enter":
							if (this.getMetrics().lines.length < this.MaxLine)
							{
								vUseText[0] = vUseText[0] + "\n";
								this.text = vUseText.join("");
								mCursorCaret += 1;
							}
							break;						
							
						case "\n":
							if (this.getMetrics().lines.length < this.MaxLine)
							{
								vUseText[0] = vUseText[0] + mKeyCode[vData];
								this.text = vUseText.join(""); 
								mCursorCaret += 1;
							}
							break;
							
						case "Clr":
							this.text = "";
							mCursorCaret = -1;
							break;
							
						default:						
							if((this.InputRange[0] == "sym") && (this.MaxChar == 1)) 
							//if(this.MaxChar == 1)) 
							{	//replace if is symbol and only 1 maxchar
								this.text = mKeyCode[vData];
								mCursorCaret = 0;
							}
							else if ((this.getMetrics().lines.length <= this.MaxLine) && ((String(this.text).length < this.MaxChar) || (this.MaxChar == 0)))
							{
								o = vUseText[0];
								vUseText[0] = vUseText[0] + mKeyCode[vData];
								this.text = vUseText.join("");
								mCursorCaret += 1;	
								
								//prevent char after space from dropping to next line,
								//remove the last input from the text
								if (this.getMetrics().lines.length > this.MaxLine)
								{
									vUseText[0] = o; 
									this.text = vUseText.join("");
									mCursorCaret -= 1;
								}
							}
							break;
					}				
					fUpdateTextArea();					
					fUpdateCaretPos();
				}	
			}
		}			
	};	
	
	UpdateKeyCode();	//do update after the declare of the keycode var
	
	//.text does not convert data to string, use fText instead
	vTarget.fText = function(vData)
	{		
		vTarget.text = String(vData);
		mCursorCaret = String(vTarget.text).length - 1;
		fUpdateCaretPos();
		
		return String(vTarget.text);
	}
	
	//set target's focus and calculate caret position 
	vTarget.Focus = function(vBool)
	{		
		if(!this.ShowFocusBorder)
		{
			mBorder.visible = false;
			vTarget.IsFocus = false;
		}
		else if(mBorder)
		{
			mBorder.visible = vBool;			
			vTarget.IsFocus = vBool;
		}
			
		if(vBool == true)
		{
			//move caret position calculation as function, allowing use by other
			mCursorCaret = fCaretPosBaseMouse();			
			
			if(mPartialSelection.length == 2)
			{
				//there's partial selection, do not blink
				if(mPartialSelection[0] != mPartialSelection[1])
				{
					vTarget.IsFocus = false;					
					vTarget.Highlight(true);	
					mPartialSelection = [];
				}
			}			
		}	
		else
		{
			if(mHighLight)
				if(mHighLight.hasOwnProperty("highlights"))
				{			
					for(i = 0 ; i < mHighLight.highlights.length ; i++)
						mHighLight.removeChild(mHighLight.highlights[i]);
					mHighLight.highlights = [];
					
					mHighLight.SelectedText = [];				
				}
			//vTarget.color = vTarget.mDefaultColor;
		}
		
		fUpdateCaretPos();
	};
	
	//Highlight all text due to double click
	vTarget.Highlight = function(vBool)
	{
		if(this.IsInput)
		{
			if(!this.ShowFocusBorder)
			{
				mBorder.visible = false;
				vTarget.IsFocus = false;
			}
			else if(mBorder)
			{
				mBorder.visible = vBool;			
				vTarget.IsFocus = vBool;
			}
				
			if(vBool == true)
			{
				var i, j, k, t;
				var o, p, q;			
				var shape;
				var vClone;
				var vClone2;
				var vClone3;
				var vSmallerIndex, vLargerIndex;
				
				if(mPartialSelection.length == 0)
					mHighLight.SelectedText = [-1, String(vTarget.text).length-1];
				else	
					mHighLight.SelectedText = mPartialSelection;
				
				o = this.getMetrics();
				
				vClone = this.clone();
				vClone2 = this.clone();
				vClone3 = this.clone();
				
				mHighLight.visible = true;
				
				if(mPartialSelection.length == 0)
				{
					for(i = 0 ; i < o.lines.length ; i++)
					{
						vClone.text = o.lines[i];
						
						// incase there's new line but no text
						if(vClone.getBounds() != null)
						{
							//create dummy text for click spot, also use for bg coloring
							shape = new createjs.Shape();			
							shape.graphics.beginFill("rgba(51, 153, 255, 1)");
							shape.graphics.drawRect(0, 0, vClone.getBounds().width, vClone.getBounds().height + 2);
							
							mHighLight.highlights.push(shape);
							mHighLight.addChild(shape);
						
							shape.x = 0;
							
							if(vTarget.textAlign == "right")
							{
								shape.x = mHighLight.getBounds().width - shape.x;																		
							}
							else if(vTarget.textAlign == "center")
							{
								if(vClone.getBounds() != null)
									shape.x = shape.x + (mHighLight.getBounds().width / 2) - (vClone.getBounds().width / 2);
								else
									shape.x = shape.x + (mHighLight.getBounds().width / 2);
							}
							
							shape.y = (o.lineHeight * i);
						}
					}
					//only when Highlighting the whole text with double click than change the color of the original text
					//vTarget.color = "#FFF";
				}
				else
				{				
					if(mPartialSelection[0] < mPartialSelection[1])
					{
						vSmallerIndex = mPartialSelection[0];
						vLargerIndex = mPartialSelection[1];
					}
					else
					{
						vSmallerIndex = mPartialSelection[1];
						vLargerIndex = mPartialSelection[0];
					}
					
					k = -1;
					t = -1;
					var vCutFrom, vCutTo;
					var vXStart;
					for(i = 0 ; i < o.lines.length ; i++)
					{		
						vXStart = 0;
						k += o.lines[i].length;
						
						if(i != 0)
						{
							k++;
							t++;
						}
							
						if((k >= vSmallerIndex) && (t <= vLargerIndex))
						{
							if(t <= vSmallerIndex)
								vCutFrom = vSmallerIndex - t;
							else
								vCutFrom = 0;
							
							if(k < vLargerIndex)
								vCutTo = k - t;
							else if( k >= vLargerIndex)
								vCutTo = vLargerIndex - t;									
	
							//if not same pos to substring, as same pos meaning no select/end of line
							if(vCutFrom != vCutTo)
							{						
								vClone.text = String(o.lines[i]).substring(vCutFrom, vCutTo); 						
								vClone2.text = String(o.lines[i]).substring(0, vCutFrom); 							
															
								if(vClone2.getBounds() != null)
									vXStart = vClone2.getBounds().width;
								else
									vXStart = 0;
									
								//create dummy text for click spot, also use for bg coloring
								shape = new createjs.Shape();			
								shape.graphics.beginFill("rgba(51, 153, 255, 1)");
								shape.graphics.drawRect(0, 0, vClone.getBounds().width, vClone.getBounds().height + 2);
								
								mHighLight.highlights.push(shape);
								mHighLight.addChild(shape);
								
								shape.x = vXStart;
								
								vClone3.text = o.lines[i];
								if(vTarget.textAlign == "right")
								{
									shape.x = mHighLight.getBounds().width - shape.x;																		
								}
								else if(vTarget.textAlign == "center")
								{
									shape.x = shape.x + (mHighLight.getBounds().width / 2) - (vClone3.getBounds().width / 2);												
								}
					
								shape.y = (o.lineHeight * i);
							}
						}					
						
						t += o.lines[i].length;						
					}
				}			
			}
			else
			{
				for(i = 0 ; i < mHighLight.highlights.length ; i++)
					mHighLight.removeChild(mHighLight.highlights[i]);
				mHighLight.highlights = [];
				
				mHighLight.SelectedText = [];
				
				//vTarget.color = vTarget.mDefaultColor;
			}
		}
	};
		
	//returns the border so that parent can swap the index
	vTarget.fBorder = function()
	{
		return mBorder;
	}
	
	//----------------------------------------------------------------------------------------------------
	//	property pSelectable; whether text is selectable.
	//----------------------------------------------------------------------------------------------------
	vTarget.pSelectable = function(
		v //Boolean
	)
	{
		if ((v != null) && (v != undefined))
		{
			vTarget.xSelectable = v;			
			
			//made not selectable but still must give size
			if(v == false)
			{
				var mPoint;
				mPoint = {};
				
				mPoint.width = 10;
				mPoint.height = 10;
				if(vTarget.getBounds())
				{
					mPoint.width = vTarget.getBounds().width;
					mPoint.height = vTarget.getBounds().height;
				}
				else if(vTarget.lineWidth)
				{
					mPoint.width = vTarget.lineWidth;
					mPoint.height = vTarget.lineHeight;
				}		
				//Set bound to textfield(base on above possible width height)
				if(vTarget.textAlign == "right")
					vTarget.bottomRight = new createjs.Point(0, 0);
				else if(vTarget.textAlign == "center")	
					vTarget.bottomRight = new createjs.Point(mPoint.width / 2, mPoint.height / 2);
				else
					vTarget.bottomRight = new createjs.Point(mPoint.width, mPoint.height);	
			}
		}
		else
			return vTarget.xSelectable;
	}
	
	function 
	UpdateKeyCode(
	)
	{
		mKeyCode = {};
		
		for (var vKeyCode in KEYMAP.KeyCodeDefault)		
			mKeyCode[vKeyCode] = KEYMAP.KeyCodeDefault[vKeyCode];
		var iii;
		//use iii instead of standard i as it clash with the for loop of parent class
		for(iii = 0 ; iii < vTarget.InputRange.length ; iii++)
		{
			switch(vTarget.InputRange[iii])
			{
				case "num":
					for (var vKeyCode in KEYMAP.KeyCodeNum)	
						mKeyCode[vKeyCode] = KEYMAP.KeyCodeNum[vKeyCode]; 					
					break;
					
				case "alp":
					for (var vKeyCode in KEYMAP.KeyCodeAlp)						 
						mKeyCode[vKeyCode] = KEYMAP.KeyCodeAlp[vKeyCode]; 
						
					for (var vKeyCode in KEYMAP.KeyAlpCommon)						 
						mKeyCode[vKeyCode] = KEYMAP.KeyAlpCommon[vKeyCode]; 
					break;
					
				case "cap":
					for (var vKeyCode in KEYMAP.KeyCodeCap)						 
						mKeyCode[vKeyCode] = KEYMAP.KeyCodeCap[vKeyCode]; 
						
					for (var vKeyCode in KEYMAP.KeyAlpCommon)						 
						mKeyCode[vKeyCode] = KEYMAP.KeyAlpCommon[vKeyCode]; 
					break;
					
				case "sym":
					for (var vKeyCode in KEYMAP.KeyCodeSym)						 
						mKeyCode[vKeyCode] = KEYMAP.KeyCodeSym[vKeyCode]; 
					break;
			}
		}
	};	
	
	//as border, dummy and caret are created and add to parent,
	//a listener is use to detect if textfield is removed, so all related items 
	//to be deleted together
	function 
	fRemoved(
		event
	) 
	{ 	
		fDbg("fRemoved -------- " + event);
		if(mHitZone != null)
		{
			mParent.removeChild(mHitZone);
			mParent.removeChild(mBorder);
			mParent.removeChild(mCaret);
			//mParent.removeChild(mHighLight);
			
			mHitZone = null;
			mBorder = null;
			mCaret = null;
			mHighLight = null;
		}
	}; 
	
	function 
	fBlink(
		event
	)
	{
		/*if(mPartialSelection.length == 2)
		{
			//there's partial selection, do not blink
			if(mPartialSelection[0] != mPartialSelection[1])
			{
				vTarget.Highlight(true);
			}			
		}
		else */
		
		if((vTarget.IsFocus == true) && (mHighLight.highlights.length == 0))
		{
			mCaret.delayme++;			
			
			//controling the blinking speed
			if((mCaret.delayme % 10) >= 6)
			{				
				mCaret.delayme = 0;
				mCaret.visible = !mCaret.visible;			
			}
		}		 
		else	
		{
			mCaret.visible = false;	
		}
	};
	
	function
	fUpdateTextArea(
	)
	{
		var o, p;
		
		//if text is empty, no bound, set text " " than resize hit and border 
		// follow by set the text back to "" empty
		p = false;
		if(vTarget.getBounds() == null)
		{
			vTarget.text = " ";
			p = true;
		}
					
		o = mHitZone.scaleX;
		if(vTarget.getBounds().height != mHitZone.getBounds().height)					
			o = (vTarget.getBounds().height + (vTarget.getMetrics().lines.length * 0.15)) / mHitZone.getBounds().height;
			
		mHitZone.scaleY = mBorder.scaleY = o;		
			
		if(p)
			vTarget.text = "";			
	}
	
	function
	fUpdateCaretPos(
	)
	{
		//fDbg("mCursorCaret >>> " + mCursorCaret);
		var i, j, k;
		var o, p, q;
		var vLine;
		var vCharCountTill;
		var vSplitAll;
		var vClone;
		var vClone3;
		var xCharPos;
		var vCaretCharWidth;
		
		if(vTarget.IsFocus == true)
		{
			o = vTarget.getMetrics();
			p = fCurrentLine();
			vLine = p[0] - 1;
			vCharCountTill = p[1];
			
			if(mCursorCaret > String(vTarget.text).length)
				xCharPos = String(vTarget.text).length;
			else
				xCharPos = (mCursorCaret - vCharCountTill) - 1;	
				
			vClone3 = vTarget.clone();
			vClone3.text = o.lines[vLine];
				
			if(xCharPos == -1)
				mCaret.caret.x = 0;
			else if(xCharPos >= String(vTarget.text).length)	
			{
				vClone = vTarget.clone();				
				vClone.text = o.lines[o.lines.length - 1];					
				
				if(vClone.getBounds() != null)	
					vCaretCharWidth = vClone.getBounds().width;
				else
					vCaretCharWidth = 0;
					
				vLine = o.lines.length - 1;
				mCaret.caret.x = vCaretCharWidth;
			}
			else
			{
				vClone = vTarget.clone();	
				vSplitAll = o.lines[vLine].split("");	
				
				vClone.text = "";            
				
				for(i = -1 ; i < xCharPos ; i++)				
					vClone.text += vSplitAll[i + 1];				
					
				if(vClone.getBounds() != null)	
					vCaretCharWidth = vClone.getBounds().width;
				else
					vCaretCharWidth = 0;
					
				mCaret.caret.x = vCaretCharWidth;
			}		
			
			if(vTarget.textAlign == "right")
			{
				mCaret.caret.x = mCaret.getBounds().width - mCaret.caret.x;																		
			}
			else if(vTarget.textAlign == "center")
			{
				if(vClone3.getBounds() == null)									
					mCaret.caret.x = mCaret.caret.x + (mCaret.getBounds().width / 2);				
				else						
					mCaret.caret.x = mCaret.caret.x + ((mCaret.getBounds().width - vClone3.getBounds().width) / 2);					
			}
			
			mCaret.caret.y = (o.lineHeight * vLine);			
		}		
	}
	
	//calculate the caret position base on mouse x/y
	function
	fCaretPosBaseMouse(
	)
	{
		//know where caret position --------------------------------------------	
		var i, j, k, t;
		var o, p, q;
		var vOrgText = this.text;	
		var vSplitAll;
		var vClone, vClone2;
		var vCalculate1, vCalculate2;			
		var vHalfCharWidth;
		var vCursorCaret;
		
		p = vTarget.globalToLocal(SYS.pMousePos().x, SYS.pMousePos().y);		
		o = vTarget.getMetrics();				
		q = Math.floor(p.y / o.lineHeight);
		
		vClone = vTarget.clone();
		vClone2 = vTarget.clone();
        
		if(o.lines[q] != undefined)
		{
			vClone2.text = o.lines[q];
			
			vSplitAll = o.lines[q].split("");
		
			j = String(vTarget.text).length - 1; //default end of text

			vClone.textAlign = "left";					
			vClone.text = "";
			
			for(i = 0 ; i < vSplitAll.length ; i++)
			{					
				//total width till now
				if(vClone.getBounds() == null)
					vHalfCharWidth = 0;
				else
					vHalfCharWidth = vClone.getBounds().width;						
					
				vClone.text += vSplitAll[i];
				//total width with new char in
				vHalfCharWidth = (vClone.getBounds().width - vHalfCharWidth) / 1.5;
						
				if(vTarget.textAlign == "right")
				{
					vCalculate1 = vClone.getBounds().width;
					vCalculate2 = p.x + vClone2.getBounds().width;																		
				}
				else if(vTarget.textAlign == "center")
				{
					vCalculate1 = vClone.getBounds().width;
					vCalculate2 = p.x + (vClone2.getBounds().width / 2);												
				}
				else
				{
					vCalculate1 = vClone.getBounds().width;
					vCalculate2 = p.x;				
				}
        
				if(vCalculate2 < 0) //if calculated still negative value, it's at front
					j = -1;					
				else if(vCalculate1 > vCalculate2)
				{
					j = i;
					t = 0; //calculate each new line what is the char length 
					for(k = 0 ; k < o.lines.length; k++)
						if(k < q)
							t += o.lines[k].split("").length;
							
					j = j + t; //add to Form the caret position	
					
					if((vCalculate1 - vHalfCharWidth) > vCalculate2) //check char half size, if caret should be before or after
						j = j - 1;
					break;
				}					
			}			
			
			//add q due to /n per new line
			vCursorCaret = j + q;
		}
		else			
			vCursorCaret = String(vTarget.text).length - 1;
		
		//cause vCursorCaret to be max if it's over 			
		if(vCursorCaret > (String(vTarget.text).length - 1))
			vCursorCaret = String(vTarget.text).length - 1;
		
		return vCursorCaret;
	}
	
	function 
	fCurrentLine(
	)
	{
		var i, j, k;
		var o, p, q;
		var vCharCountTill;
		var vLine;
		
		o = vTarget.getMetrics();
		j = -1;
		vLine = 0;
		
		vCharCountTill = String(vTarget.text).length;
		for(i = 0 ; i < o.lines.length ; i++)
		{				
			j += o.lines[i].length;
        
			if(i != 0)
				j++;
				
			if(j >= mCursorCaret)
			{
				vLine = i;
				vCharCountTill = j - o.lines[i].length;
				break;
			}							
		}
		//vLine return as real line count not Array count, so number do not start with 0
		return [(vLine + 1) , vCharCountTill, o.lines.length];
	}
	
	function 
	fMoveDirection(
		vDirection
	)
	{
		var i, j, k;
		var o, p, q;
		var vClone;
		var vClone2;
		var vCloneCompare;
		var vUseText;
		var vCloneWidth;
		var vClone2Width;
		var difference;
		
		vClone = vTarget.clone();		
		vClone2 = vTarget.clone();		
		
		o = vTarget.getMetrics();
		p = fCurrentLine();
		
		//calculate where to slice
		k = 0;
		for(i = 0 ; i < (p[0] - 1) ; i++)
		{
			k += o.lines[i].length;
			
			if(i != 0)
				k++;
		}
			
		vClone.text = String(vTarget.text).substring(k, mCursorCaret + 1); 		
		vClone2.text = "";
		
		if(vDirection == "up")		
			q = o.lines[p[0] - 2].split("");			
		else		
			q = o.lines[p[0]].split("");
			
		if(vClone.getBounds() == null)
			vCloneWidth = 0;
		else
			vCloneWidth = vClone.getBounds().width;
			
		if(vClone2.getBounds() == null)
			vClone2Width = 0;						
			
		for(i = 0 ; i < q.length ; i++)
		{					
			if(vClone2.getBounds() != null)
			{								
				if(vClone2.getBounds().width != null)				
					vClone2Width = vClone2.getBounds().width;
				else
					vClone2Width = 0;
			}
			else 
				vClone2Width = 0;
				
			difference = Math.abs(vClone2Width - vCloneWidth);

			if(difference < 1)
			{
				break;
			}	
			else if (vClone2Width > vCloneWidth)
			{	
				i = i - 1;
				break;
			}
			vClone2.text += q[i];
		}
		
		k = 0;
		if(vDirection == "up")		
		{
			for(j = 0 ; j < (p[0] - 2) ; j++)	
			{
				k += o.lines[j].length;	
				
				if(j != 0)
					k++;
			}				
		}
		else		
		{
			for(j = 0 ; j < p[0] ; j++)	
			{					
				k += o.lines[j].length;	
				
				if(j != 0)
					k++;
			}
		}
        
		k = (k + i);		
		return k;
	}
}		

function 
cDummyText(
	vFake,
	vReal
)
{
	cBase(vFake, "DummyText");	
	
	//make textfield able to receive render signal
	vFake.fRender = function(vData) 
	{ 	 		
		//divert fRender to this actual class to handle
		vReal.fRender(vData);
	};
	
	vFake.RealText = vReal;
}; 



 
 
 
 
 
 
 
 
 
